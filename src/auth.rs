use crate::config::AppState;
use crate::db;
use crate::sql_types::AdminEnum;
use diesel::prelude::*;
use rocket::http::Status;
use rocket::request::{self, FromRequest, Request};
use rocket::{Outcome, State};
use serde::{Deserialize, Serialize};
use std::error;
use std::fmt;

use jsonwebtoken as jwt;

use crate::config;

#[derive(Debug, Clone)]
pub struct BadAuth;

impl fmt::Display for BadAuth {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "User is not logged in but attempted to do action that requires login data"
        )
    }
}

impl error::Error for BadAuth {
    fn description(&self) -> &str {
        "User is not logged in"
    }

    fn cause(&self) -> Option<&(dyn error::Error)> {
        // Generic error, underlying cause isn't tracked.
        None
    }
}

pub fn validate_auth(
    conn: &PgConnection,
    queue_name: Option<String>,
    auth: Auth,
    auth_level: AuthLevel,
) -> std::result::Result<Auth, Box<dyn std::error::Error>> {
    match auth_level {
        AuthLevel::Any => Ok(auth),
        AuthLevel::Assistant => {
            let queue_name = queue_name.ok_or_else(|| BadAuth)?;
            match db::admins::admin_for_queue(conn, &queue_name, &auth) {
                Some(_) => Ok(auth),
                None => Err(Box::new(BadAuth)),
            }
        }
        AuthLevel::Teacher => {
            let queue_name = queue_name.ok_or_else(|| BadAuth)?;
            match db::admins::admin_for_queue(conn, &queue_name, &auth) {
                Some(AdminEnum::Teacher) => Ok(auth),
                _ => Err(Box::new(BadAuth)),
            }
        }
        AuthLevel::SuperOrTeacher => match db::super_admins::is_super(conn, auth.id) {
            Some(_) => Ok(auth),
            None => {
                let queue_name = queue_name.ok_or_else(|| BadAuth)?;
                match db::admins::admin_for_queue(conn, &queue_name, &auth) {
                    Some(AdminEnum::Teacher) => Ok(auth),
                    _ => Err(Box::new(BadAuth)),
                }
            }
        },
        AuthLevel::Super => match db::super_admins::is_super(conn, auth.id) {
            Some(_) => Ok(auth),
            None => Err(Box::new(BadAuth)),
        },
    }
}

pub enum AuthLevel {
    Any,
    Assistant,
    Teacher,
    SuperOrTeacher,
    Super,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Auth {
    /// timestamp
    pub exp: i64,
    /// user id
    pub id: i32,
    pub username: String,
    pub ugkthid: String,
    pub realname: String,
}

impl Auth {
    pub fn token(&self, secret: &[u8]) -> String {
        jwt::encode(&jwt::Header::default(), self, secret).expect("jwt")
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for Auth {
    type Error = ();

    /// Extract Auth token from the "Authorization" header.
    ///
    /// Handlers with Auth guard will fail with 503 error.
    /// Handlers with Option<Auth> will be called with None.
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Auth, Self::Error> {
        let state: State<AppState> = request.guard()?;
        if let Some(auth) = extract_auth_from_request(request, &state.secret) {
            Outcome::Success(auth)
        } else {
            Outcome::Failure((Status::Forbidden, ()))
        }
    }
}

fn extract_auth_from_request(request: &Request, secret: &[u8]) -> Option<Auth> {
    request
        .headers()
        .get_one("authorization")
        .and_then(extract_token_from_header)
        .and_then(|token| decode_token(token, secret))
}

fn extract_token_from_header(header: &str) -> Option<&str> {
    if header.starts_with(config::TOKEN_PREFIX) {
        Some(&header[config::TOKEN_PREFIX.len()..])
    } else {
        None
    }
}

/// Decode token into `Auth` struct. If any error is encountered, log it
/// an return None.
pub fn decode_token(token: &str, secret: &[u8]) -> Option<Auth> {
    use jwt::{Algorithm, Validation};

    jwt::decode(token, secret, &Validation::new(Algorithm::HS256))
        .map_err(|err| {
            eprintln!("Auth decode error: {:?}", err);
        })
        .ok()
        .map(|token_data| token_data.claims)
}
