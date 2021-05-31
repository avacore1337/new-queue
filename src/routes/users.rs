use crate::auth::Auth;
use crate::config::AppState;
use crate::db;
use crate::errors::{Errors, FieldValidator};
use crate::util::{handle_login, Ticket};
use anyhow::{anyhow, Result};
use openidconnect::core::{
    CoreAuthenticationFlow, CoreClient, CoreProviderMetadata, CoreUserInfoClaims,
};

use openidconnect::{
    AccessTokenHash, AuthorizationCode, ClientId, ClientSecret, CsrfToken, IssuerUrl, Nonce,
    PkceCodeChallenge, RedirectUrl, Scope,
};
use rocket::http::{Cookie, Cookies};
use rocket::request::Form;
use rocket::response::Redirect;
use rocket::State;
use rocket_client_addr::ClientAddr;
use rocket_contrib::json::{Json, JsonValue};
use serde::Deserialize;
use std::env;

use openidconnect::reqwest::http_client;

use openidconnect::{OAuth2TokenResponse, TokenResponse};

#[derive(Deserialize)]
pub struct LoginUser {
    user: LoginUserData,
}

#[derive(Deserialize)]
struct LoginUserData {
    username: Option<String>,
}

#[get("/user")]
pub fn get_user(
    auth: Auth,
    state: State<AppState>,
    conn: db::DbConn,
    client_addr: &ClientAddr,
) -> Result<JsonValue, Errors> {
    match db::users::find(&conn, auth.id) {
        Some(user) => Ok(json!(user.to_user_auth(&conn, &state.secret, client_addr))),
        None => Err(Errors::new(&[("user", "does not exist")])),
    }
}

#[post("/users/login", format = "json", data = "<user>")]
pub fn post_users_login(
    user: Json<LoginUser>,
    conn: db::DbConn,
    state: State<AppState>,
    client_addr: &ClientAddr,
) -> Result<JsonValue, Errors> {
    if cfg!(debug_assertions) {
        let user = user.into_inner().user;

        let mut extractor = FieldValidator::default();
        let username = extractor.extract("username", user.username);
        extractor.check()?;

        match db::users::login(&conn, &username) {
            Some(user) => Ok(json!(user.to_user_auth(&conn, &state.secret, client_addr))),
            None => Err(Errors::new(&[("username", "does not exist")])),
        }
    } else {
        Err(Errors::new(&[("auth", "not allowed")]))
    }
}

#[get("/login")]
pub fn kth_login(mut cookies: Cookies) -> Redirect {
    if let Ok(oidc) = env::var("USE_OIDC") {
        println!("use oidc: {}", oidc);
        match oidc.as_str() {
            "true" => match use_oidc(cookies) {
                Ok(redirect) => return redirect,
                Err(err) => {
                    println!("oidc error: {:?}", err);

                    return Redirect::to("https://queue.csc.kth.se/failed_login");
                }
            },
            _ => {}
        }
    }
    Redirect::to("https://login.kth.se/login?service=https://queue.csc.kth.se/auth")
}

#[derive(FromForm, Default)]
pub struct Code {
    code: Option<String>,
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
            println!("got nonce: {}", nonce);
            match get_oidc_user(params, Nonce::new(nonce.to_string())) {
                Ok(_) => println!("good login!"),
                Err(err) => {
                    println!("oidc error: {:?}", err);
                }
            }
        }
        None => println!("failed to get nonce"),
    }
    Redirect::to("/")
}

#[get("/auth?<params..>")]
pub fn kth_auth(
    mut cookies: Cookies,
    conn: db::DbConn,
    state: State<AppState>,
    params: Form<Ticket>,
    client_addr: &ClientAddr,
) -> Redirect {
    match handle_login(&conn, params) {
        Some(user) => {
            println!("User logged in: {:?}", user);
            cookies.add(Cookie::new(
                "userdata",
                json!(user.to_user_auth(&conn, &state.secret, client_addr)).to_string(),
            ));
        }
        None => println!("Login failed for some reason..."),
    }
    Redirect::to("/")
}

pub fn get_client() -> Result<CoreClient> {
    // "https://login.ug.kth.se/adfs/.well-known/openid-configuration".to_string(),
    // println!(
    //     "metadata: {:?}",
    //     &IssuerUrl::new(
    //         "https://login.ug.kth.se/adfs/.well-known/openid-configuration".to_string(),
    //     )?
    // );
    let provider_metadata = CoreProviderMetadata::discover(
        &IssuerUrl::new("https://login.ug.kth.se/adfs".to_string())?,
        http_client,
    )?;

    // Create an OpenID Connect client by specifying the client ID, client secret, authorization URL
    // and token URL.
    let application_id = env::var("APPLICATION_ID").expect("OIDC need an application ID");
    let client_secret = env::var("CLIENT_SECRET").expect("OIDC need a client secret");
    let client = CoreClient::from_provider_metadata(
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
    println!("generating redirect");
    let client = get_client()?;

    // Generate the full authorization URL.
    let (auth_url, _csrf_token, nonce) = client
        .authorize_url(
            CoreAuthenticationFlow::AuthorizationCode,
            CsrfToken::new_random,
            Nonce::new_random,
        )
        // Set the desired scopes.
        // .add_scope(Scope::new("openid".to_string()))
        .url();

    // This is the URL you should redirect the user to, in order to trigger the authorization
    // process.

    cookies.add(Cookie::new("nonce", nonce.secret().clone()));
    println!("wrote nonce: {:?}", nonce.secret());
    Ok(Redirect::to(auth_url.to_string()))
}

pub fn get_oidc_user(params: Form<Code>, nonce: Nonce) -> Result<()> {
    println!("got nonce: {:?}", nonce.secret());
    let client = get_client()?;
    println!("getting oidc_user");
    let code = params
        .code
        .as_ref()
        .ok_or_else(|| anyhow!("got no code in request"))?;
    println!("code: {}", code);
    // Once the user has been redirected to the redirect URL, you'll have access to the
    // authorization code. For security reasons, your code should verify that the `state`
    // parameter returned by the server matches `csrf_state`.

    // Now you can exchange it for an access token and ID token.
    let token_response = client
        .exchange_code(AuthorizationCode::new(code.to_string()))
        .request(http_client)?;

    println!("Got token response");
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
    println!(
        "User {} with e-mail address {} has authenticated successfully",
        claims.subject().as_str(),
        claims
            .email()
            .map(|email| email.as_str())
            .unwrap_or("<not provided>"),
    );

    // If available, we can use the UserInfo endpoint to request additional information.

    // The user_info request uses the AccessToken returned in the token response. To parse custom
    // claims, use UserInfoClaims directly (with the desired type parameters) rather than using the
    // CoreUserInfoClaims type alias.
    let _userinfo: CoreUserInfoClaims = client
        .user_info(token_response.access_token().to_owned(), None)
        .map_err(|err| anyhow!("No user info endpoint: {:?}", err))?
        .request(http_client)
        .map_err(|err| anyhow!("Failed requesting user info: {:?}", err))?;

    // See the OAuth2TokenResponse trait for a listing of other available fields such as
    // access_token() and refresh_token().
    Ok(())
}
