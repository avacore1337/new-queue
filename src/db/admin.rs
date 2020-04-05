use crate::models::admin::Admin;
use crate::models::user::User;
use crate::schema::admins;
use diesel::pg::PgConnection;
use diesel::prelude::*;
// use diesel::result::{DatabaseErrorKind, Error};

// pub fn create(
//     conn: &PgConnection,
//     user: User,
//     queue_id: i32,
//     location: &str,
//     usercomment: &str,
// ) -> Result<QueueEntry, diesel::result::Error> {
//     let new_queue = &NewQueueEntry {
//         user_id,
//         queue_id,
//         location,
//         usercomment,
//     };

//     diesel::insert_into(queue_entries::table)
//         .values(new_queue)
//         .get_result::<QueueEntry>(conn)
//         .map_err(Into::into)
// }
