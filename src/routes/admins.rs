use crate::auth::Auth;
use crate::db::{self, admins};

use rocket_contrib::json::JsonValue;

#[get("/queues/<queue_name>/teachers")]
pub fn get_teachers(queue_name: String, _auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(admins::teachers_for_queue(&conn, &queue_name)?))
}

#[get("/queues/<queue_name>/assistants")]
pub fn get_assistants(queue_name: String, _auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(admins::assistants_for_queue(&conn, &queue_name)?))
}
