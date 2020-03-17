#![allow(proc_macro_derive_resolution_fallback)]

use super::schema::posts;
use super::schema::kthusers;
use super::schema::queues;


use diesel;
use diesel::prelude::*;

use serde::{Serialize, Deserialize};

pub fn all(connection: &PgConnection) -> QueryResult<Vec<Queue>> {
    queues::table.load::<Queue>(&*connection)
}

pub fn get(id: i32, connection: &PgConnection) -> QueryResult<Queue> {
    queues::table.find(id).get_result::<Queue>(connection)
}

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


#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
pub struct Queue {
        pub id: i32,
        pub locked : bool,
        pub hiding : bool,
        pub motd: String,
        pub info : String,
  }

#[derive(Insertable, Deserialize)]
#[table_name = "queues"]
struct NewQueue {
        locked : bool,
        hiding : bool,
        motd: String,
        info : String,
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
