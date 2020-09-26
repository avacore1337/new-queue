use crate::models::queue_entry::QueueEntry;
use crate::models::user_event::{SendableUserEvent, UserEvent};
use crate::schema::{queue_entries, queues, user_events, users};
use chrono::{DateTime, TimeZone, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use rocket::request::Form;
use std::convert::TryInto;

pub fn for_queue(
    conn: &PgConnection,
    queue_name: &str,
    params: Form<Interval>,
) -> Option<Vec<SendableUserEvent>> {
    let mut query = user_events::table
        .inner_join(users::table)
        .inner_join(queues::table)
        .select((
            users::username,
            users::ugkthid,
            users::realname,
            user_events::time,
            user_events::help,
            user_events::left_queue,
            user_events::queue_length,
            user_events::help_amount,
            user_events::present_amount,
        ))
        .filter(queues::name.eq(queue_name))
        .into_boxed();
    if let Some(from) = params.from {
        let from: DateTime<Utc> = Utc.timestamp(from, 0);
        query = query.filter(user_events::time.ge(from));
    }
    if let Some(until) = params.until {
        let until: DateTime<Utc> = Utc.timestamp(until, 0);
        query = query.filter(user_events::time.le(until));
    }

    match query.load(conn) {
        Ok(events) => {
            println!("got {} user_events", events.len());
            Some(events)
        }
        Err(e) => {
            println!("Something went wrong when fetching user_events: {}", e);
            None
        }
    }
}

#[derive(FromForm, Default)]
pub struct Interval {
    from: Option<i64>,
    until: Option<i64>,
}

pub fn create(
    conn: &PgConnection,
    queue_entry: &QueueEntry,
    left_queue: bool,
) -> Result<UserEvent, diesel::result::Error> {
    let help_amount: i32 = queue_entries::table
        .filter(
            queue_entries::queue_id
                .eq(queue_entry.queue_id)
                .and(queue_entries::help.eq(true)),
        )
        .count()
        .get_result::<i64>(conn)?
        .try_into()
        .expect("Too many entries");
    let present_amount: i32 = queue_entries::table
        .filter(
            queue_entries::queue_id
                .eq(queue_entry.queue_id)
                .and(queue_entries::help.eq(false)),
        )
        .count()
        .get_result::<i64>(conn)?
        .try_into()
        .expect("Too many entries");
    let queue_length = help_amount + present_amount;
    let new_event = &NewUserEvent {
        user_id: queue_entry.user_id,
        queue_id: queue_entry.queue_id,
        help: queue_entry.help,
        left_queue,
        queue_length,
        help_amount,
        present_amount,
    };

    diesel::insert_into(user_events::table)
        .values(new_event)
        .get_result::<UserEvent>(conn)
        .map_err(Into::into)
}

#[derive(Insertable)]
#[table_name = "user_events"]
pub struct NewUserEvent {
    user_id: i32,
    queue_id: i32,
    help: bool,
    left_queue: bool,
    queue_length: i32,
    help_amount: i32,
    present_amount: i32,
}
