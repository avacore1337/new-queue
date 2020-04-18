use crate::db;

use rocket_contrib::json::JsonValue;

#[get("/queues")]
pub fn get_queues(conn: db::DbConn) -> JsonValue {
    json!({ "queues": db::queues::all(&conn) })
}

#[get("/queues/<queue_name>")]
pub fn get_queue(queue_name: String, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(db::queues::find_by_name(&conn, &queue_name).ok()?))
}
