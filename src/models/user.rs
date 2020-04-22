use crate::auth::Auth;
use crate::schema::users;
use chrono::{Duration, Utc};
use serde::Serialize;

#[derive(Identifiable, Queryable, Serialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub ugkthid: String,
    pub realname: String,
}

#[derive(Serialize)]
pub struct UserAuth<'a> {
    username: &'a str,
    ugkthid: &'a str,
    realname: &'a str,
    superadmin: bool,
    assistant_in: Vec<String>,
    teacher_in: Vec<String>,
    token: String,
}

#[derive(Serialize)]
pub struct Profile {
    username: String,
    ugkthid: String,
    realname: String,
}

impl User {
    pub fn to_user_auth(&self, secret: &[u8]) -> UserAuth {
        let exp = Utc::now() + Duration::days(60); // TODO: make sure it works as expected when it expires
        let token = Auth {
            id: self.id,
            username: self.username.clone(),
            ugkthid: self.ugkthid.clone(),
            realname: self.realname.clone(),
            exp: exp.timestamp(),
        }
        .token(secret);

        UserAuth {
            username: &self.username,
            ugkthid: &self.ugkthid,
            realname: &self.realname,
            superadmin: false,
            assistant_in: vec!["INDA".to_string()],
            teacher_in: vec!["ADK".to_string()],
            token,
        }
    }
}
