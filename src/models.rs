use std::time::{SystemTime};

use super::schema::posts;
use super::schema::kthusers;
use super::schema::queues;

use serde::{Serialize, Deserialize};

use diesel::sql_types::Timestamp;

#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
// #[derive(Queryable, Serialize, Deserialize)]
// #[table_name = "kthusers"]
pub struct Kthuser {
        pub id: i32,
        pub username: String,
        pub ugkthid : String,
        pub realname : String,
        pub location : String,
        pub starttime : chrono::NaiveDate,
        pub gettinghelp : bool,
        pub helper : String,
        pub help : bool,
        pub badlocation : bool,
}
        // pub starttime : chrono::NaiveDateTime,

// #[derive(Queryable, AsChangeset)]
#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
pub struct Queue {
        pub id: i32,
        pub locked : bool,
        pub hiding : bool,
        pub motd: String,
        pub info : String,
  }

#[derive(Queryable)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub published: bool,
}


#[derive(Insertable)]
#[table_name="posts"]
pub struct NewPost<'a> {
    pub title: &'a str,
    pub body: &'a str,
}
