use crate::auth::Auth;
use crate::db;
use crate::sql_types::AdminEnum;
use crate::wsroutes::ws_rs::RoomHandler;
use crate::wsroutes::*;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
// use crate::db::DbConn;
// Change the alias to `Box<error::Error>`.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AddUser {
    pub username: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JoinQueue {
    pub comment: String,
    pub help: bool,
    pub location: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GettingHelp {
    pub status: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Kick {
    pub ugkthid: String,
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
    conn: &PgConnection,
    add_user: AddUser,
) -> Result<()> {
    let _admin = db::super_admins::create(conn, &add_user.username)?;
    handler.send_self("addSuperAdmin", json!(add_user));
    Ok(())
}

pub fn add_queue_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let _queue = db::queues::create(conn, queue_name).map_err(|_e| BadAuth)?;
    handler.send_self(&("addTeacher/".to_string() + queue_name), json!({}));
    Ok(())
}
pub fn kick_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    kick: Kick,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let entry = db::queue_entries::find_by_ugkthid(conn, queue.id, &kick.ugkthid)?;
    let _todo = diesel::delete(&entry).execute(&*conn);
    handler.broadcast_room(queue_name, "leaveQueue", json!(kick));
    Ok(())
}

pub fn add_teacher_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: AddUser,
    queue_name: &str,
) -> Result<()> {
    let admin = db::admins::create(conn, queue_name, &add_user.username, AdminEnum::Teacher)?;
    handler.send_self(
        &("addTeacher/".to_string() + queue_name),
        json!(db::users::find(conn, admin.user_id)),
    );
    Ok(())
}

pub fn add_assistant_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: AddUser,
    queue_name: &str,
) -> Result<()> {
    let admin = db::admins::create(conn, queue_name, &add_user.username, AdminEnum::Teacher)?;
    handler.send_self(
        &("addAssistant/".to_string() + queue_name),
        json!(db::users::find(conn, admin.user_id)),
    );
    Ok(())
}
