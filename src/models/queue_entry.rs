#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::queue::Queue;
use crate::models::user::User;
use crate::schema::{queue_entries, users};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use serde::Serialize;

use chrono::{DateTime, Utc};

#[derive(Identifiable, Queryable, Associations, Debug)]
#[belongs_to(parent = "User")]
#[belongs_to(parent = "Queue")]
#[table_name = "queue_entries"]
pub struct QueueEntry {
    pub id: i32,
    pub user_id: i32,
    pub queue_id: i32,
    pub location: String,
    pub comment: String,
    pub starttime: DateTime<Utc>,
    pub gettinghelp: bool,
    pub help: bool,
    pub badlocation: bool,
}

#[derive(Serialize, Queryable, Clone)]
pub struct SendableQueueEntry {
    pub username: String,
    pub ugkthid: String,
    pub realname: String,
    pub location: String,
    pub comment: String,
    pub starttime: DateTime<Utc>,
    pub gettinghelp: bool,
    pub help: bool,
    pub badlocation: bool,
}

impl QueueEntry {
    pub fn to_sendable(&self, conn: &PgConnection) -> SendableQueueEntry {
        let user = users::table
            .find(self.user_id)
            .get_result::<User>(conn)
            .unwrap();
        SendableQueueEntry {
            username: user.username,
            ugkthid: user.ugkthid,
            realname: user.realname,
            location: self.location.clone(),
            comment: self.comment.clone(),
            starttime: self.starttime,
            gettinghelp: self.gettinghelp,
            help: self.help,
            badlocation: self.badlocation,
        }
    }
}
