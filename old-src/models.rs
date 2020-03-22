#![allow(proc_macro_derive_resolution_fallback)]

use super::schema::posts;
use super::schema::kthusers;

use diesel;
use diesel::prelude::*;
use chrono::{DateTime, Utc};

use serde::{Serialize, Deserialize};


#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
// #[derive(Queryable, Serialize, Deserialize)]
// #[table_name = "kthusers"]
pub struct Kthuser {
        pub id: i32,
        pub username: String,
        pub ugkthid : String,
        pub realname : String,
        pub location : String,
        pub starttime: DateTime<Utc>,
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


#[derive(Insertable)]
#[table_name="posts"]
pub struct NewPost<'a> {
    pub title: &'a str,
    pub body: &'a str,
}
