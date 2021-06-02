use crate::config::AppState;
use crate::db;
use crate::util::ugkthid_to_user;
use anyhow::{anyhow, Result};
use openidconnect::core::{
    CoreAuthDisplay, CoreAuthPrompt, CoreAuthenticationFlow, CoreErrorResponseType,
    CoreGenderClaim, CoreJsonWebKey, CoreJsonWebKeyType, CoreJsonWebKeyUse,
    CoreJweContentEncryptionAlgorithm, CoreJwsSigningAlgorithm, CoreProviderMetadata,
    CoreRevocableToken, CoreRevocationErrorResponse, CoreTokenIntrospectionResponse, CoreTokenType,
};
use serde::Serialize;

use openidconnect::{
    AccessTokenHash, AdditionalClaims, AuthorizationCode, Client, ClientId, ClientSecret,
    CsrfToken, EmptyExtraTokenFields, IdTokenFields, IssuerUrl, Nonce, RedirectUrl, Scope,
    StandardErrorResponse, StandardTokenResponse,
};
use rocket::http::{Cookie, Cookies};
use rocket::request::Form;
use rocket::response::Redirect;
use rocket::State;
use rocket_client_addr::ClientAddr;
use serde::Deserialize;
use std::env;

use openidconnect::reqwest::http_client;
use openidconnect::{OAuth2TokenResponse, TokenResponse};

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
pub struct KthAdditionalClaims {
    kthid: std::string::String,
}
impl AdditionalClaims for KthAdditionalClaims {}

pub type KthIdTokenFields = IdTokenFields<
    KthAdditionalClaims,
    EmptyExtraTokenFields,
    CoreGenderClaim,
    CoreJweContentEncryptionAlgorithm,
    CoreJwsSigningAlgorithm,
    CoreJsonWebKeyType,
>;

pub type KthTokenResponse = StandardTokenResponse<KthIdTokenFields, CoreTokenType>;

// EmptyAdditionalClaims,
type KthClient = Client<
    KthAdditionalClaims,
    CoreAuthDisplay,
    CoreGenderClaim,
    CoreJweContentEncryptionAlgorithm,
    CoreJwsSigningAlgorithm,
    CoreJsonWebKeyType,
    CoreJsonWebKeyUse,
    CoreJsonWebKey,
    CoreAuthPrompt,
    StandardErrorResponse<CoreErrorResponseType>,
    KthTokenResponse,
    CoreTokenType,
    CoreTokenIntrospectionResponse,
    CoreRevocableToken,
    CoreRevocationErrorResponse,
>;

#[get("/login")]
pub fn kth_login(cookies: Cookies) -> Redirect {
    match use_oidc(cookies) {
        Ok(redirect) => redirect,
        Err(err) => {
            println!("oidc error: {:?}", err);
            Redirect::to("https://queue.csc.kth.se/failed_login")
        }
    }
}

#[derive(FromForm, Default)]
pub struct Code {
    code: Option<String>,
    #[allow(dead_code)]
    state: Option<String>,
}

#[get("/oidc-auth?<params..>")]
pub fn kth_oidc_auth(
    mut cookies: Cookies,
    conn: db::DbConn,
    state: State<AppState>,
    params: Form<Code>,
    client_addr: &ClientAddr,
) -> Redirect {
    println!("starting oidc auth");
    // cookies.add(Cookie::new("nonce", nonce.secret().clone()));
    match cookies.get("nonce") {
        Some(nonce) => {
            println!("got nonce: {}", nonce.value());
            match get_oidc_user(params, Nonce::new(nonce.value().to_string())) {
                Ok(ugkthid) => {
                    println!("good login!");
                    match ugkthid_to_user(&conn, ugkthid) {
                        Some(user) => {
                            println!("User logged in: {:?}", user);
                            cookies.add(Cookie::new(
                                "userdata",
                                json!(user.to_user_auth(&conn, &state.secret, client_addr))
                                    .to_string(),
                            ));
                        }
                        None => println!("Login failed for some reason..."),
                    }
                }
                Err(err) => {
                    println!("oidc error: {:?}", err);
                }
            }
        }
        None => println!("failed to get nonce"),
    }
    Redirect::to("/")
}

pub fn get_client() -> Result<KthClient> {
    let provider_metadata = CoreProviderMetadata::discover(
        &IssuerUrl::new("https://login.ug.kth.se/adfs".to_string())?,
        http_client,
    )?;

    // Create an OpenID Connect client by specifying the client ID, client secret, authorization URL
    // and token URL.
    let application_id = env::var("APPLICATION_ID").expect("OIDC need an application ID");
    let client_secret = env::var("CLIENT_SECRET").expect("OIDC need a client secret");
    let client = KthClient::from_provider_metadata(
        provider_metadata,
        ClientId::new(application_id),
        Some(ClientSecret::new(client_secret)),
    )
    // Set the URL the user will be redirected to after the authorization process.
    .set_redirect_uri(RedirectUrl::new(
        "https://queue.csc.kth.se/oidc-auth".to_string(),
    )?);
    Ok(client)
}

pub fn use_oidc(mut cookies: Cookies) -> Result<Redirect> {
    let client = get_client()?;

    // Generate the full authorization URL.
    let (auth_url, _csrf_token, nonce) = client
        .authorize_url(
            CoreAuthenticationFlow::AuthorizationCode,
            CsrfToken::new_random,
            Nonce::new_random,
        )
        // Set the desired scopes.
        .add_scope(Scope::new("kthid".to_string()))
        .url();

    cookies.add(Cookie::new("nonce", nonce.secret().clone()));
    // println!("wrote nonce: {:?}", nonce.secret());
    Ok(Redirect::to(auth_url.to_string()))
}

pub fn get_oidc_user(params: Form<Code>, nonce: Nonce) -> Result<String> {
    // println!("got nonce: {:?}", nonce.secret());
    let client = get_client()?;
    let code = params
        .code
        .as_ref()
        .ok_or_else(|| anyhow!("got no code in request"))?;
    // Once the user has been redirected to the redirect URL, you'll have access to the
    // authorization code. For security reasons, your code should verify that the `state`
    // parameter returned by the server matches `csrf_state`.

    // Now you can exchange it for an access token and ID token.
    let token_response = client
        .exchange_code(AuthorizationCode::new(code.to_string()))
        .request(http_client)?;

    // Extract the ID token claims after verifying its authenticity and nonce.
    let id_token = token_response
        .id_token()
        .ok_or_else(|| anyhow!("Server did not return an ID token"))?;
    let claims = id_token.claims(&client.id_token_verifier(), &nonce)?;

    println!("Got the claims: {:?}", claims);
    // Verify the access token hash to ensure that the access token hasn't been substituted for
    // another user's.
    if let Some(expected_access_token_hash) = claims.access_token_hash() {
        let actual_access_token_hash =
            AccessTokenHash::from_token(token_response.access_token(), &id_token.signing_alg()?)?;
        if actual_access_token_hash != *expected_access_token_hash {
            return Err(anyhow!("Invalid access token"));
        }
    }
    println!("almost done now!");

    // The authenticated user's identity is now available. See the IdTokenClaims struct for a
    // complete listing of the available claims.
    println!("Got kthid: {:?}", claims.additional_claims().kthid);
    Ok(claims.additional_claims().kthid.clone())
}
