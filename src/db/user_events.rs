use crate::db::queues;
use crate::models::user_event::UserEvent;
use crate::schema::user_events;
use chrono::{DateTime, TimeZone, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use rocket::request::Form;

pub fn for_queue(
    conn: &PgConnection,
    queue_name: &str,
    params: Form<Interval>,
) -> Option<Vec<UserEvent>> {
    // from: DateTime<Utc>,
    // until: DateTime<Utc>,
    let queue = queues::find_by_name(conn, queue_name).ok()?;
    let mut query = UserEvent::belonging_to(&queue).into_boxed();
    if let Some(from) = params.from {
        let from: DateTime<Utc> = Utc.timestamp(from, 0);
        query = query.filter(user_events::time.ge(from));
    }
    if let Some(until) = params.until {
        let until: DateTime<Utc> = Utc.timestamp(until, 0);
        query = query.filter(user_events::time.le(until));
    }
    // .and(user_events::time.le(until)));

    query.load(conn).ok()
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
