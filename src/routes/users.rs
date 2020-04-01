use crate::auth::Auth;
use crate::config::AppState;
use crate::db::{self, users::UserCreationError};
use crate::errors::{Errors, FieldValidator};

use rocket::State;
use rocket_contrib::json::{Json, JsonValue};
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize)]
pub struct NewUser {
    user: NewUserData,
}

#[derive(Deserialize, Validate)]
struct NewUserData {
    #[validate(length(min = 1))]
    username: Option<String>,
    #[validate(length(min = 1))]
    ugkthid: Option<String>,
    #[validate(length(min = 1))]
    realname: Option<String>,
}

#[post("/users", format = "json", data = "<new_user>")]
pub fn post_users(
    new_user: Json<NewUser>,
    conn: db::DbConn,
    state: State<AppState>,
) -> Result<JsonValue, Errors> {
    let new_user = new_user.into_inner().user;

    let mut extractor = FieldValidator::validate(&new_user);
    let username = extractor.extract("username", new_user.username);
    let ugkthid = extractor.extract("ugkthid", new_user.ugkthid);
    let realname = extractor.extract("realname", new_user.realname);

    extractor.check()?;

    db::users::create(&conn, &username, &ugkthid, &realname)
        .map(|user| json!({ "user": user.to_user_auth(&state.secret) }))
        .map_err(|error| {
            let field = match error {
                UserCreationError::DuplicatedUsername => "username",
            };
            Errors::new(&[(field, "has already been taken")])
        })
}

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

// #[derive(Deserialize)]
// pub struct UpdateUser {
//     user: db::users::UpdateUserData,
// }

// #[put("/user", format = "json", data = "<user>")]
// pub fn put_user(
//     user: Json<UpdateUser>,
//     auth: Auth,
//     conn: db::DbConn,
//     state: State<AppState>,
// ) -> Option<JsonValue> {
//     db::users::update(&conn, auth.id, &user.user)
//         .map(|user| json!({ "user": user.to_user_auth(&state.secret) }))
// }
