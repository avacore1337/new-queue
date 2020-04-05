use crate::models::user::User;
use crate::schema::users;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};

#[derive(Insertable)]
#[table_name = "users"]
pub struct NewUser<'a> {
    pub username: &'a str,
    pub ugkthid: &'a str,
    pub realname: &'a str,
}

pub enum UserCreationError {
    DuplicatedUsername,
}

impl From<Error> for UserCreationError {
    fn from(err: Error) -> UserCreationError {
        if let Error::DatabaseError(DatabaseErrorKind::UniqueViolation, info) = &err {
            match info.constraint_name() {
                Some("users_username_key") => return UserCreationError::DuplicatedUsername,
                _ => {}
            }
        }
        panic!("Error creating user: {:?}", err)
    }
}

pub fn create(
    conn: &PgConnection,
    username: &str,
    ugkthid: &str,
    realname: &str,
) -> Result<User, UserCreationError> {
    let new_user = &NewUser {
        username,
        ugkthid,
        realname,
    };

    diesel::insert_into(users::table)
        .values(new_user)
        .get_result::<User>(conn)
        .map_err(Into::into)
}

pub fn login(conn: &PgConnection, username: &str) -> Option<User> {
    let user = users::table
        .filter(users::username.eq(username))
        .get_result::<User>(conn)
        .map_err(|err| eprintln!("login_user: {}", err))
        .ok()?;
    Some(user)
}

pub fn username_to_id(conn: &PgConnection, username: &str) -> Result<i32, diesel::result::Error> {
    users::table
        .filter(users::username.eq(username))
        .select(users::id)
        .first(&*conn)
        .map_err(Into::into)
}

pub fn find(conn: &PgConnection, id: i32) -> Option<User> {
    users::table
        .find(id)
        .get_result(conn)
        .map_err(|err| println!("find_user: {}", err))
        .ok()
}

// // TODO: remove clone when diesel will allow skipping fields
// #[derive(Deserialize, AsChangeset, Default, Clone)]
// #[table_name = "users"]
// pub struct UpdateUserData {
//     username: Option<String>,
//     email: Option<String>,
//     bio: Option<String>,
//     image: Option<String>,

//     // hack to skip the field
//     #[column_name = "hash"]
//     password: Option<String>,
// }

// pub fn update(conn: &PgConnection, id: i32, data: &UpdateUserData) -> Option<User> {
//     let data = &UpdateUserData {
//         password: None,
//         ..data.clone()
//     };
//     diesel::update(users::table.find(id))
//         .set(data)
//         .get_result(conn)
//         .ok()
// }
