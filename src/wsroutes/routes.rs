use crate::auth::Auth;
use crate::db;
use crate::wsroutes::ws_rs::RoomHandler;
use crate::wsroutes::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
// use crate::db::DbConn;
// Change the alias to `Box<error::Error>`.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AddUser {
    pub username: String,
}

pub fn leave_queue_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &db::DbConn,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    db::queue_entries::remove(&conn, queue.id, auth.id)?;
    handler.broadcast_room(
        &queue.name,
        "leaveQueue",
        json!({ "ugkthid": &auth.ugkthid }),
    );
    Ok(())
}

pub fn add_super_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &db::DbConn,
    add_user: AddUser,
) -> Result<()> {
    let _admin = db::super_admins::create(&*conn, &add_user.username)?;
    handler.send_self("addSuperAdmin", json!(add_user));
    Ok(())
}

pub fn add_queue_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &db::DbConn,
    queue_name: &str,
) -> Result<()> {
    let _queue = db::queues::create(&*conn, queue_name).map_err(|_e| BadAuth)?;
    handler.send_self(&("addTeacher/".to_string() + queue_name), json!({}));
    Ok(())
}
