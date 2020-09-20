use crate::auth::Auth;
use crate::db;
use crate::errors::ServerError;
use crate::models::queue_entry::QueueEntry;
use crate::sql_types::AdminEnum;
use crate::wsroutes::ws_rs::RoomHandler;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

// Change the alias to `Box<error::Error>`.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum BadLocationType {
    UnknownLocation,
    WrongLocation,
}

#[serde(rename_all = "camelCase")]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BadLocationMessage {
    pub ugkthid: String,
    pub bad_location_type: BadLocationType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Username {
    pub username: String,
}

#[serde(rename_all = "camelCase")]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RenameQueue {
    pub new_queue_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateQueueEntry {
    pub comment: String,
    pub help: bool,
    pub location: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Status {
    pub status: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserStatus {
    pub status: bool,
    pub ugkthid: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Text {
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FromMessage {
    pub message: String,
    pub sender: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserMessage {
    pub message: String,
    pub ugkthid: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Ugkthid {
    pub ugkthid: String,
}

pub fn leave_queue_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let queue_entry = db::queue_entries::find(&conn, queue.id, auth.id)?;
    let _todo = diesel::delete(&queue_entry).execute(conn);
    db::user_events::create(conn, &queue_entry, true)?;
    handler.broadcast_room(
        &queue.name,
        "leaveQueue",
        json!({ "ugkthid": &auth.ugkthid }),
    );
    handler.broadcast_lobby(
        &queue.name,
        "leaveQueue",
        json!({ "ugkthid": &auth.ugkthid }),
    );
    Ok(())
}

pub fn add_super_admin_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    add_user: Username,
) -> Result<()> {
    let user = db::users::get_or_create(conn, &add_user.username).map_err(|_| ServerError)?;
    let admin = db::super_admins::create(conn, user)?;
    handler.send_self("addSuperAdmin", json!(db::users::find(conn, admin.user_id)));
    Ok(())
}

pub fn remove_super_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    add_user: Username,
) -> Result<()> {
    let _admin = db::super_admins::remove(conn, &add_user.username)?;
    handler.send_self("removeSuperAdmin", json!(add_user));
    Ok(())
}

pub fn add_queue_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let _queue = db::queues::create(conn, queue_name).map_err(|_e| ServerError)?;
    handler.send_self(&("addQueue/".to_string() + queue_name), json!({}));
    Ok(())
}

pub fn rename_queue_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    rename_queue: RenameQueue,
    queue_name: &str,
) -> Result<()> {
    let new_queue_name = &rename_queue.new_queue_name;
    match db::queues::find_by_name(conn, new_queue_name) {
        Ok(_) => Err(Box::new(ServerError)),
        Err(_) => {
            db::queues::rename(conn, queue_name, new_queue_name)?;
            handler.send_self(&("addQueue/".to_string() + new_queue_name), json!({}));
            handler.send_self(&("removeQueue/".to_string() + queue_name), json!({}));
            Ok(())
        }
    }
}

pub fn remove_queue_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let _queue = db::queues::remove(conn, queue_name).map_err(|_e| ServerError)?;
    handler.send_self(&("removeQueue/".to_string() + queue_name), json!({}));
    Ok(())
}

pub fn kick_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    ugkthid: Ugkthid,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let entry = db::queue_entries::find_by_ugkthid(conn, queue.id, &ugkthid.ugkthid)?;
    let _todo = diesel::delete(&entry).execute(&*conn);
    db::user_events::create(conn, &entry, true)?;
    handler.broadcast_room(queue_name, "leaveQueue", json!(ugkthid));
    handler.broadcast_lobby(&queue.name, "leaveQueue", json!(ugkthid));
    Ok(())
}

pub fn set_queue_info_route(
    handler: &mut RoomHandler,
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
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    match db::admins::find_by_name(conn, queue_name, &add_user.username) {
        Ok(admin) => match admin.admin_type {
            AdminEnum::Assistant => {
                println!("Upgrading {} to teacher", &add_user.username);
                handler.send_self(
                    &("removeAssistant/".to_string() + queue_name),
                    json!(add_user),
                );
                db::admins::make_teacher(conn, &admin)?;
                handler.send_self(
                    &("addTeacher/".to_string() + queue_name),
                    json!(db::users::find(conn, admin.user_id)),
                );
            }
            AdminEnum::Teacher => {}
        },
        Err(_) => {
            let user =
                db::users::get_or_create(conn, &add_user.username).map_err(|_| ServerError)?;
            let admin = db::admins::create(conn, queue_name, user, AdminEnum::Teacher)?;
            handler.send_self(
                &("addTeacher/".to_string() + queue_name),
                json!(db::users::find(conn, admin.user_id)),
            );
        }
    };
    Ok(())
}

pub fn add_assistant_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    match db::admins::find_by_name(conn, queue_name, &add_user.username) {
        Ok(_) => Ok(()),
        Err(_) => {
            let user =
                db::users::get_or_create(conn, &add_user.username).map_err(|_| ServerError)?;
            let admin = db::admins::create(conn, queue_name, user, AdminEnum::Assistant)?;
            handler.send_self(
                &("addAssistant/".to_string() + queue_name),
                json!(db::users::find(conn, admin.user_id)),
            );
            Ok(())
        }
    }
}

pub fn remove_teacher_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    let _admin = db::admins::remove(conn, queue_name, &add_user.username, AdminEnum::Teacher)?;
    handler.send_self(
        &("removeTeacher/".to_string() + queue_name),
        json!(add_user),
    );
    Ok(())
}

pub fn remove_assistant_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    add_user: Username,
    queue_name: &str,
) -> Result<()> {
    let _admin = db::admins::remove(conn, queue_name, &add_user.username, AdminEnum::Assistant)?;
    handler.send_self(
        &("removeAssistant/".to_string() + queue_name),
        json!(add_user),
    );
    Ok(())
}

pub fn set_help_status_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    status: Status,
    queue_name: &str,
) -> Result<()> {
    if !status.status {
        return Err(Box::new(ServerError));
    }
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let queue_entry =
        db::queue_entries::update_help_status(&conn, queue.id, auth.id, status.status)?;
    handler.broadcast_room(
        queue_name,
        "updateQueueEntry",
        json!(queue_entry.to_sendable(conn)),
    );
    Ok(())
}

pub fn set_user_help_status_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    user_status: UserStatus,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let user = db::users::find_by_ugkthid(conn, &user_status.ugkthid)?;
    let queue_entry =
        db::queue_entries::update_help_status(&conn, queue.id, user.id, user_status.status)?;
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
    queue_entry: UpdateQueueEntry,
    queue_name: &str,
) -> Result<()> {
    println!("Joining queue: {}", queue_name);
    let queue = db::queues::find_by_name(conn, queue_name)?;
    if queue.locked {
        return Ok(());
    }
    let queue_entry = db::queue_entries::create(
        &conn,
        auth.id,
        queue.id,
        &queue_entry.location,
        &queue_entry.comment,
        queue_entry.help,
    )?;
    db::user_events::create(conn, &queue_entry, false)?;
    println!("QueueEntry {:?}", queue_entry);

    let sendable = queue_entry.to_sendable(conn);
    handler.broadcast_room(queue_name, "joinQueue", json!(sendable.clone()));
    handler.broadcast_lobby(&queue.name, "joinQueue", json!(sendable));
    Ok(())
}

pub fn broadcast_route(
    handler: &mut RoomHandler,
    auth: Auth,
    message: Text,
    queue_name: &str,
) -> Result<()> {
    println!("Broadcasting in room: {}", queue_name);
    handler.broadcast_room(
        queue_name,
        "message",
        json!(FromMessage {
            message: message.message,
            sender: auth.realname,
        }),
    );
    Ok(())
}

pub fn broadcast_faculty_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    message: Text,
    queue_name: &str,
) -> Result<()> {
    println!("Broadcasting to faculty in queue: {}", queue_name);

    if let Some(faculty) = db::admins::for_queue(conn, queue_name) {
        for user in faculty {
            handler.send_user_message(queue_name, &user.ugkthid, &message.message, &auth.realname);
        }
    }
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
        &auth.realname,
    );
    Ok(())
}

pub fn update_queue_entry_route(
    handler: &mut RoomHandler,
    auth: Auth,
    conn: &PgConnection,
    queue_entry: UpdateQueueEntry,
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
    println!("QueueEntry : {:?}", queue_entry);

    handler.broadcast_room(
        queue_name,
        "updateQueueEntry",
        json!(queue_entry.to_sendable(conn)),
    );
    Ok(())
}

pub fn bad_location_route(
    handler: &mut RoomHandler,
    auth: Auth,
    bad_location_message: BadLocationMessage,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let ugkthid = &bad_location_message.ugkthid;
    let queue = db::queues::find_by_name(conn, queue_name)?;
    let user = db::users::find_by_ugkthid(conn, ugkthid)?;
    let queue_entry = db::queue_entries::update_bad_location(&conn, queue.id, user.id, true)?;
    handler.broadcast_room(
        queue_name,
        "updateQueueEntry",
        json!(queue_entry.to_sendable(conn)),
    );
    let message = match bad_location_message.bad_location_type {
        BadLocationType::UnknownLocation => "The teaching assistant in '".to_string() + queue_name + "' could not locate you. The teaching assistant won't try to find you again until you have updated your information.",
        BadLocationType::WrongLocation => "You are currently located in the wrong room for a teaching assistant in ".to_string() + queue_name + " to come to you.",
    };

    handler.send_user_message(queue_name, ugkthid, &message, &auth.realname);
    Ok(())
}

pub fn set_queue_motd_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    text: Text,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::update_motd(&conn, queue_name, &text.message)?;
    handler.broadcast_room(queue_name, "updateQueue", json!(queue));
    Ok(())
}

pub fn purge_queue_route(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::find_by_name(&conn, queue_name)?;
    let entries: Vec<QueueEntry> = QueueEntry::belonging_to(&queue).load(conn)?;
    db::queue_entries::remove_multiple(conn, &entries)?;
    for entry in entries {
        db::user_events::create(conn, &entry, true)?;
        if let Some(user) = db::users::find(conn, entry.user_id) {
            handler.broadcast_room(
                &queue.name,
                "leaveQueue",
                json!({ "ugkthid": &user.ugkthid }),
            );
        }
    }
    Ok(())
}

pub fn set_queue_lock_status(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    status: Status,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::update_locked(&conn, queue_name, status.status)?;
    handler.broadcast_room(queue_name, "updateQueue", json!(queue));
    handler.broadcast_lobby(queue_name, "updateQueue", json!(queue));
    Ok(())
}

pub fn set_queue_hide_status(
    handler: &mut RoomHandler,
    conn: &PgConnection,
    status: Status,
    queue_name: &str,
) -> Result<()> {
    let queue = db::queues::update_hiding(&conn, queue_name, status.status)?;
    handler.broadcast_room(queue_name, "updateQueue", json!(queue));
    handler.broadcast_lobby(queue_name, "updateQueue", json!(queue));
    handler.send_self(&("updateQueue/".to_string() + queue_name), json!(queue));
    Ok(())
}
