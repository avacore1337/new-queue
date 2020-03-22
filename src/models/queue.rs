use chrono::{Duration, Utc};
use serde::Serialize;

use crate::schema::queues;

use diesel;
use diesel::prelude::*;

#[derive(Queryable, Serialize)]
pub struct Queue {
        pub id: i32,
        pub name: String,
        pub locked : bool,
        pub hiding : bool,
        pub motd: String,
        pub info : String,
  }
