use std::time::{Duration, SystemTime};

#[derive(Queryable)]
pub struct User {
        pub id: i32,
        pub username: String,
        pub ugkthid : String,
        pub realname : String,
        pub location : String,
        pub starttime : SystemTime,
        pub gettinghelp : bool,
        pub helper : String,
        pub help : bool,
        pub badlocation : bool,
}

#[derive(Queryable)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub published: bool,
}

use super::schema::posts;

#[derive(Insertable)]
#[table_name="posts"]
pub struct NewPost<'a> {
    pub title: &'a str,
    pub body: &'a str,
}
