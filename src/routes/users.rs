use crate::config::AppState;
use crate::db::{self};
use crate::errors::{Errors, FieldValidator};
use crate::util::{handle_login, Ticket};

use rocket::http::{Cookie, Cookies};
use rocket::request::Form;
use rocket::response::Redirect;
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
    if cfg!(debug_assertions) {
        let user = user.into_inner().user;

        let mut extractor = FieldValidator::default();
        let username = extractor.extract("username", user.username);
        extractor.check()?;

        match db::users::login(&conn, &username) {
            Some(user) => Ok(json!(user.to_user_auth(&conn, &state.secret))),
            None => Err(Errors::new(&[("username", "does not exist")])),
        }
    } else {
        Err(Errors::new(&[("auth", "not allowed")]))
    }
}

#[get("/users/login2")]
pub fn kth_login() -> Redirect {
    Redirect::to("https://login.kth.se/login?service=http://queue.csc.kth.se/auth")
}

#[get("/auth?<params..>")]
pub fn kth_auth(
    mut cookies: Cookies,
    conn: db::DbConn,
    state: State<AppState>,
    params: Form<Ticket>,
) -> Redirect {
    match handle_login(&conn, params) {
        Some(user) => {
            cookies.add(Cookie::new(
                "userdata",
                json!(user.to_user_auth(&conn, &state.secret)).to_string(),
            ));
        }
        None => println!("Login failed for some reason..."),
    }
    // TODO redirect to login target (where they came from)
    Redirect::to("/")
}

// app.get('/login2', function(req, res) {
//   res.redirect('https://login.kth.se/login?service=http://queue.csc.kth.se/auth');
// });
