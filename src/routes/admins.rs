use crate::auth::{validate_auth, Auth, AuthLevel};
use crate::db::{self, admins};

use rocket_contrib::json::JsonValue;

#[get("/queues/<queue_name>/teachers")]
pub fn get_teachers(queue_name: String, auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    println!("pre auth /teachers");
    let _auth = validate_auth(
        &conn,
        Some(queue_name.clone()),
        auth,
        AuthLevel::SuperOrTeacher,
    )
    .ok()?;
    println!("got auth /teachers");
    Some(json!(admins::teachers_for_queue(&conn, &queue_name)?))
}

#[get("/queues/<queue_name>/assistants")]
pub fn get_assistants(queue_name: String, auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    println!("pre auth /assistants");
    let _auth = validate_auth(
        &conn,
        Some(queue_name.clone()),
        auth,
        AuthLevel::SuperOrTeacher,
    )
    .ok()?;
    println!("got auth /assistants");
    Some(json!(admins::assistants_for_queue(&conn, &queue_name)?))
}
