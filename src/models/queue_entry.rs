#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::user::User;
use crate::schema::queue_entries;
use serde::Serialize;

use chrono::{DateTime, Utc};

#[derive(Queryable, Serialize, Associations)]
#[belongs_to(parent = "User")]
#[table_name = "queue_entries"]
pub struct QueueEntry {
    pub id: i32,
    pub user_id: i32,
    pub queue_id: i32,
    pub comment: String,
    pub location: String,
    pub starttime: DateTime<Utc>,
    pub gettinghelp: bool,
    pub help: bool,
    pub badlocation: bool,
}
