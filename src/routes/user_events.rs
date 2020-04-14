use crate::db::{self};
use chrono::Utc;

use rocket_contrib::json::JsonValue;

#[get("/queues/<queue_name>/queue_entries")]
pub fn get_user_events(queue_name: String, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(db::user_events::for_queue(
        &conn,
        &queue_name,
        Utc::now(),
        Utc::now()
    )?))
}
