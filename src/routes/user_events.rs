use crate::auth::{validate_auth, Auth, AuthLevel};
use crate::db;
use rocket::request::Form;

use rocket_contrib::json::JsonValue;

#[get("/queues/<queue_name>/user_events?<params..>")]
pub fn get_user_events(
    auth: Auth,
    queue_name: String,
    params: Form<db::user_events::Interval>,
    conn: db::DbConn,
) -> Option<JsonValue> {
    let _auth = validate_auth(
        &conn,
        Some(queue_name.clone()),
        auth,
        AuthLevel::SuperOrTeacher,
    )
    .ok()?;
    Some(json!(db::user_events::for_queue(
        &conn,
        &queue_name,
        params
    )?))
}
