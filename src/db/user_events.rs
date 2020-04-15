use crate::db::queues;
use crate::models::user_event::UserEvent;
use crate::schema::user_events;
use chrono::{DateTime, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn for_queue(
    conn: &PgConnection,
    queue_name: &str,
    from: DateTime<Utc>,
    until: DateTime<Utc>,
) -> Option<Vec<UserEvent>> {
    let queue = queues::find_by_name(conn, queue_name).ok()?;
    UserEvent::belonging_to(&queue)
        .filter(user_events::time.ge(from).and(user_events::time.le(until)))
        .load(conn)
        .ok()
}

#[derive(FromForm, Default)]
pub struct Interval {
    from: Option<i64>,
    until: Option<i64>,
}

// pub fn create(
//     conn: &PgConnection,
//     user_id: i32,
//     queue_id: i32,
//     help: bool,
// ) -> Result<QueueEntry, diesel::result::Error> {
//     let new_queue = &NewQueueEntry {
//         user_id,
//         queue_id,
//         location,
//         usercomment,
//         help,
//     };

//     diesel::insert_into(queue_entries::table)
//         .values(new_queue)
//         .get_result::<QueueEntry>(conn)
//         .map_err(Into::into)
// }

// #[derive(Insertable)]
// #[table_name = "queue_entries"]
// pub struct NewQueueEntry<'a> {
//     user_id: i32,
//     queue_id: i32,
//     location: &'a str,
//     usercomment: &'a str,
//     help: bool,
// }
