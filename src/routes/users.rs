use crate::auth::Auth;
use crate::config::AppState;
use crate::db::{self};
use crate::errors::{Errors, FieldValidator};

use rocket::State;
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

#[post("/users/login", format = "json", data = "<user>")]
pub fn post_users_login(
    user: Json<LoginUser>,
    conn: db::DbConn,
    state: State<AppState>,
) -> Result<JsonValue, Errors> {
    let user = user.into_inner().user;

    let mut extractor = FieldValidator::default();
    let username = extractor.extract("username", user.username);
    extractor.check()?;

    db::users::login(&conn, &username)
        .map(|user| json!({ "user": user.to_user_auth(&state.secret) }))
        .ok_or_else(|| Errors::new(&[("username", "does not exist")]))
}

#[get("/user")]
pub fn get_user(auth: Auth, conn: db::DbConn, state: State<AppState>) -> Option<JsonValue> {
    db::users::find(&conn, auth.id).map(|user| json!({ "user": user.to_user_auth(&state.secret) }))
}
