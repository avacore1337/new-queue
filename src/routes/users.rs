use crate::auth::Auth;
use crate::config::AppState;
use crate::db;
use crate::errors::{Errors, FieldValidator};
use rocket::State;
use rocket_client_addr::ClientAddr;
use rocket_contrib::json::{Json, JsonValue};
use serde::Deserialize;

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
