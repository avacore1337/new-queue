#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::queue::Queue;
use crate::models::user::User;
use crate::schema::{admins, queues, users};
use crate::sql_types::AdminEnum;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

// #[derive(Queryable, Serialize, Associations)]
#[derive(Queryable, Associations)]
#[belongs_to(parent = "User")]
#[belongs_to(parent = "Queue")]
pub struct Admin {
    pub id: i32,
    pub user_id: i32,
    pub queue_id: i32,
    pub admin_type: AdminEnum,
}

// #[derive(Serialize)]
// pub struct SendableAdmin {
//     pub username: String,
//     pub realname: String,
//     pub admin_type: AdminType,
// }

// impl QueueEntry {
//     pub fn to_sendable(&self, conn: &PgConnection) -> SendableQueueEntry {
//         // let queue = queues
//         //     .find(self.queue_id)
//         //     .get_result::<Queue>(conn)
//         //     .unwrap();
//         let user = users::table
//             .find(self.user_id)
//             .get_result::<User>(conn)
//             .unwrap();
//         SendableQueueEntry {
//             username: user.username,
//             ugkthid: user.ugkthid,
//             realname: user.realname,
//             comment: self.comment.clone(),
//             location: self.location.clone(),
//             starttime: self.starttime,
//             gettinghelp: self.gettinghelp,
//             help: self.help,
//             badlocation: self.badlocation,
//         }
//     }
// }
