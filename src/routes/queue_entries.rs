use crate::db;

use rocket_contrib::json::JsonValue;

#[get("/queues/<queue_name>/queue_entries")]
pub fn get_queue_entries(queue_name: String, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(db::queue_entries::for_queue(&conn, &queue_name)?))
}

#[get("/queue_entries")]
pub fn get_all_queue_entries(conn: db::DbConn) -> JsonValue {
    json!(db::queue_entries::all(&conn))
}
