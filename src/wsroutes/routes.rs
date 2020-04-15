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
pub struct Username {
    pub username: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QueueEntry {
    pub comment: String,
    pub help: bool,
    pub location: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GettingHelp {
    pub status: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Text {
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserMessage {
    pub message: String,
    pub ugkthid: String,
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

pub fn add_super_admin_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: Username,
) -> Result<()> {
    let admin = db::super_admins::create(conn, &add_user.username)?;
    handler.send_self("addSuperAdmin", json!(db::users::find(conn, admin.user_id)));
    Ok(())
}

pub fn remove_super_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: Username,
) -> Result<()> {
    let _admin = db::super_admins::remove(conn, &add_user.username)?;
    handler.send_self("removeSuperAdmin", json!(add_user));
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

pub fn remove_queue_route(
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

pub fn update_queue_info_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    text: Text,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::update_info(&conn, queue_name, &text.message)?;
    handler.broadcast_room(queue_name, "updateQueue", json!(queue));
    Ok(())
}

pub fn add_teacher_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: Username,
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
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    let admin = db::admins::create(conn, queue_name, &add_user.username, AdminEnum::Teacher)?;
    handler.send_self(
        &("addTeacher/".to_string() + queue_name),
        json!(db::users::find(conn, admin.user_id)),
    );
    Ok(())
}

pub fn remove_teacher_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    let _admin = db::admins::remove(conn, queue_name, &add_user.username)?;
    handler.send_self(
        &("removeTeacher/".to_string() + queue_name),
        json!(add_user),
    );
    Ok(())
}

pub fn remove_assistant_route(
    handler: &mut RoomHandler,
    _auth: Auth,
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    let _admin = db::admins::remove(conn, queue_name, &add_user.username)?;
    handler.send_self(
        &("removeAssistant/".to_string() + queue_name),
        json!(add_user),
    );
    Ok(())
}

pub fn getting_help_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    getting_help: GettingHelp,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let queue_entry =
        db::queue_entries::update_help_status(&conn, queue.id, auth.id, getting_help.status)?;
    handler.broadcast_room(
        queue_name,
        "updateQueueEntry",
        json!(queue_entry.to_sendable(conn)),
    );
    Ok(())
}

pub fn join_queue_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    queue_entry: QueueEntry,
    queue_name: &str,
) -> Result<()> {
    println!("Joining queue: {}", queue_name);
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let queue_entry = db::queue_entries::create(
        &conn,
        auth.id,
        queue.id,
        &queue_entry.location,
        &queue_entry.comment,
        queue_entry.help,
    )?;
    println!("QueueEntry ID: {}", queue_entry.id);

    handler.broadcast_room(
        queue_name,
        "joinQueue",
        json!(queue_entry.to_sendable(conn)),
    );
    Ok(())
}

pub fn send_message_route(
    handler: &mut RoomHandler,
    auth: Auth,
    user_message: UserMessage,
    queue_name: &str,
) -> Result<()> {
    handler.send_user_message(
        queue_name,
        &user_message.ugkthid,
        &user_message.message,
        &auth.username, //TODO chango to realname?
    );
    Ok(())
}

pub fn update_queue_entry_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    queue_entry: QueueEntry,
    queue_name: &str,
) -> Result<()> {
    println!("Joining queue: {}", queue_name);
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let queue_entry = db::queue_entries::update_user_data(
        &conn,
        queue.id,
        auth.id,
        &queue_entry.location,
        &queue_entry.comment,
        queue_entry.help,
    )?;
    // let queue_entry = db::queue_entries::find(&conn, auth.id, queue.id)?;
    println!("QueueEntry ID: {}", queue_entry.id);

    handler.broadcast_room(
        queue_name,
        "updateQueueEntry",
        json!(queue_entry.to_sendable(conn)),
    );
    Ok(())
}
