#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::queue::Queue;
use crate::models::user::User;
use crate::schema::user_events;
use serde::Serialize;

use chrono::{DateTime, Utc};

#[derive(Identifiable, Queryable, Associations, Serialize)]
#[belongs_to(parent = "User")]
#[belongs_to(parent = "Queue")]
#[table_name = "user_events"]
pub struct UserEvent {
    pub id: i32,
    pub user_id: i32,
    pub queue_id: i32,
    pub time: DateTime<Utc>,
    pub help: bool,
    pub left_queue: bool,
    pub queue_length: i32,
    pub help_amount: i32,
    pub present_amount: i32,
}
