use crate::auth::Auth;
use crate::config::AppState;
use crate::db::{self};
use crate::errors::{Errors, FieldValidator};
use crate::util::{handle_login, Ticket};
use rocket::http::{Cookie, Cookies};
use rocket::request::Form;
use rocket::response::Redirect;
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

#[get("/login")]
pub fn kth_login() -> Redirect {
    Redirect::to("https://login.kth.se/login?service=https://queue.csc.kth.se/auth")
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
