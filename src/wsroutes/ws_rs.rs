use ws::{listen, CloseCode, Handler, Handshake, Message, Request, Response, Sender};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
use crate::db;
use crate::db::queue_entries;
use crate::models::queue::Queue;
use crate::sql_types::AdminEnum;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, from_value, json};
use std::cell::{Cell, RefCell, RefMut};
use std::collections::HashMap;
use std::error;
use std::fmt;
use std::rc::Rc;

enum AuthLevel {
    Any,
    Assistant,
    Teacher,
    SuperOrTeacher,
    Super,
}

// Change the alias to `Box<error::Error>`.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Debug, Clone)]
struct BadAuth;

impl fmt::Display for BadAuth {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "User is not logged in but attempted to do action that requires login data"
        )
    }
}

impl error::Error for BadAuth {
    fn description(&self) -> &str {
        "User is not logged in"
    }

    fn cause(&self) -> Option<&(dyn error::Error)> {
        // Generic error, underlying cause isn't tracked.
        None
    }
}

use serde_json::Value as Json;

#[derive(Serialize, Debug, Clone)]
struct SendWrapper {
    path: String,
    content: Json,
}

#[derive(Deserialize, Debug, Clone)]
struct Wrapper {
    path: String,
    token: String,
    content: Json,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct AddUser {
    username: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct JoinQueue {
    comment: String,
    help: bool,
    location: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct GettingHelp {
    status: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Kick {
    ugkthid: String,
}

struct RoomHandler {
    out: Sender,
    count: Rc<Cell<u32>>,
    rooms: Rc<RefCell<HashMap<String, Vec<Sender>>>>,
    secret: Vec<u8>,
    pool: Rc<RefCell<db::PgPool>>,
}

impl Handler for RoomHandler {
    fn on_request(&mut self, req: &Request) -> ws::Result<Response> {
        match req.resource() {
            "/ws" => {
                // used once for const socket = new WebSocket("ws://" + window.location.host + "/ws");
                // https://blog.stanko.io/do-you-really-need-websockets-343aed40aa9b
                // and no need for reconnect later

                // https://ws-rs.org/api_docs/ws/struct.Request.html
                println!("Browser Request from {:?}", req.origin().unwrap().unwrap());
                println!("Client found is {:?}", req.client_addr().unwrap());
                let resp = Response::from_request(req);
                resp
            }

            _ => Ok(Response::new(404, "Not Found", b"404 - Not Found".to_vec())),
        }
    }

    fn on_open(&mut self, handshake: Handshake) -> ws::Result<()> {
        // We have a new connection, so we increment the connection counter
        self.count.set(self.count.get() + 1);
        let number_of_connection = self.count.get();
        //
        // The most important part and used to assign id for clients
        let open_message = format!(
            "{} entered and the number of live connections is {}",
            &handshake.peer_addr.unwrap(),
            &number_of_connection
        );

        println!("{}", &open_message);
        Ok(())
    }

    // Handle messages recieved in the websocket (in this case, only on /ws)
    fn on_message(&mut self, message: Message) -> ws::Result<()> {
        let raw_message = message.clone().into_text()?;
        println!("The message from the client is {:#?}", &raw_message);
        if let Err(e) = self.handle_message(&raw_message) {
            self.send_error_message(e, &raw_message);
        };

        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away => println!("The client is leaving the site."),
            CloseCode::Abnormal => {
                println!("Closing handshake failed! Unable to obtain closing status from client.")
            }
            _ => println!("The client encountered an error: {}", reason),
        }
        self.leave_room();
        self.count.set(self.count.get() - 1)
    }

    fn on_error(&mut self, err: ws::Error) {
        println!("The RoomHandler encountered an error: {:?}", err);
    }
}

impl RoomHandler {
    fn handle_message(&mut self, text_msg: &str) -> Result<()> {
        let wrapper = from_str::<Wrapper>(text_msg)?;
        self.route_wrapper(wrapper)
    }

    fn get_db_connection(&mut self) -> db::DbConn {
        let pool: RefMut<_> = self.pool.borrow_mut();
        let conn = pool.get().unwrap();
        db::DbConn(conn)
    }

    // fn deserialize<T, F>(&mut self, wrapper: Wrapper, fun: F) -> Result<()>
    // where
    //     T: for<'de> serde::Deserialize<'de>,
    //     F: Fn(&mut Self, T) -> Result<()>,
    // {
    //     let v = from_value::<T>(wrapper.content.clone())?;
    //     fun(self, v)
    // }

    fn auth_deserialize<T, F>(
        &mut self,
        wrapper: Wrapper,
        room_name: &str,
        fun: F,
        auth_level: AuthLevel,
    ) -> Result<()>
    where
        T: for<'de> serde::Deserialize<'de>,
        F: Fn(&mut Self, Auth, T, &Queue) -> Result<()>,
    {
        let v = from_value::<T>(wrapper.content.clone())?;
        let conn = &self.get_db_connection();
        let queue = db::queues::find_by_name(conn, room_name)?;
        let auth = self.get_auth(&wrapper.token, auth_level, &queue)?;
        fun(self, auth, v, &queue)
    }

    fn auth<F>(
        &mut self,
        wrapper: Wrapper,
        room_name: &str,
        fun: F,
        auth_level: AuthLevel,
    ) -> Result<()>
    where
        F: Fn(&mut Self, Auth, &Queue) -> Result<()>,
    {
        let conn = &self.get_db_connection();
        let queue = db::queues::find_by_name(conn, room_name)?;
        let auth = self.get_auth(&wrapper.token, auth_level, &queue)?;
        fun(self, auth, &queue)
    }

    // fn auth_admins(&mut self, auth: &Auth, queue: &Queue) -> Option<AdminEnum> {
    //     let conn = &self.get_db_connection();
    //     db::admins::admin_for_queue(conn, &queue.name, auth)
    // }

    fn get_auth(&mut self, token: &str, auth_level: AuthLevel, queue: &Queue) -> Result<Auth> {
        let conn = &self.get_db_connection();
        match decode_token(token, &self.secret) {
            Some(auth) => match auth_level {
                AuthLevel::Any => Ok(auth),
                AuthLevel::Assistant => {
                    match db::admins::admin_for_queue(conn, &queue.name, &auth) {
                        Some(_) => Ok(auth),
                        None => Err(Box::new(BadAuth)),
                    }
                }
                AuthLevel::Teacher => match db::admins::admin_for_queue(conn, &queue.name, &auth) {
                    Some(AdminEnum::Teacher) => Ok(auth),
                    _ => Err(Box::new(BadAuth)),
                },
                AuthLevel::SuperOrTeacher => Ok(auth),
                AuthLevel::Super => match db::super_admins::is_super(conn, &auth) {
                    Some(_) => Ok(auth),
                    None => Err(Box::new(BadAuth)),
                },
            },
            None => Err(Box::new(BadAuth)),
        }
    }

    fn send_error_message(&mut self, e: Box<dyn std::error::Error>, message: &str) {
        println!("Message {:?}, resulted in error: {:?}", message, e);
        let _ = self.out.send(
            json!({
                "path": "/error",
                "content": format!("Message {:?}, resulted in error: {:?}", message, e),
            })
            .to_string(),
        );
    }

    fn route_wrapper(&mut self, wrapper: Wrapper) -> Result<()> {
        println!("wrapper.path {:#?}", &wrapper.path);
        println!("wrapper.content {:#?}", &wrapper.content);

        let path = wrapper.path.clone();
        match path.split('/').collect::<Vec<&str>>().as_slice() {
            ["subscribeLobby"] => self.subscribe_lobby_route(),
            // "/logout" => self.logout_route(),
            ["unsubscribeLobby"] => self.unsubscribe_queue_route(),
            ["unsubscribeQueue", _queue_name] => self.unsubscribe_queue_route(),
            ["subscribeQueue", queue_name] => self.subscribe_queue_route(queue_name),
            ["joinQueue", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::join_queue_route,
                AuthLevel::Any,
            ),
            ["leaveQueue", queue_name] => self.auth(
                wrapper,
                queue_name,
                RoomHandler::leave_queue_route,
                AuthLevel::Any,
            ),
            ["gettingHelp", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::getting_help_route,
                AuthLevel::Any,
            ),
            ["kick", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::kick_route,
                AuthLevel::Assistant,
            ),
            ["addTeacher", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::add_teacher_route,
                AuthLevel::SuperOrTeacher,
            ),
            ["addAssistant", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::add_assistant_route,
                AuthLevel::SuperOrTeacher,
            ),
            ["addSuperAdmin", queue_name] => self.auth_deserialize(
                wrapper,
                queue_name,
                RoomHandler::add_super_route,
                AuthLevel::Super,
            ),
            ["addQueue", queue_name] => self.auth(
                wrapper,
                queue_name,
                RoomHandler::add_queue,
                AuthLevel::Super,
            ),
            _ => {
                println!("Route does not exist");
                Ok(())
            }
        }
    }

    fn subscribe_queue_route(&mut self, queue_name: &str) -> Result<()> {
        println!("joining room {}", queue_name);
        self.join_room(&queue_name)
    }

    fn subscribe_lobby_route(&mut self) -> Result<()> {
        println!("joining lobby ");
        self.join_lobby()
    }

    fn unsubscribe_queue_route(&mut self) -> Result<()> {
        self.leave_room();
        Ok(())
    }

    fn kick_route(&mut self, _auth: Auth, kick: Kick, queue: &Queue) -> Result<()> {
        let conn: &PgConnection = &*&self.get_db_connection();
        let entry = db::queue_entries::find_by_ugkthid(conn, queue.id, &kick.ugkthid)?;
        let _todo = diesel::delete(&entry).execute(conn);
        self.broadcast_room(&queue.name, "leaveQueue", json!(kick));
        Ok(())
    }

    fn add_teacher_route(&mut self, _auth: Auth, add_user: AddUser, queue: &Queue) -> Result<()> {
        let conn = &self.get_db_connection();
        let admin = db::admins::create(conn, &queue.name, &add_user.username, AdminEnum::Teacher)?;
        self.send_self(
            &("addTeacher/".to_string() + &queue.name),
            json!(db::users::find(conn, admin.user_id)),
        );
        Ok(())
    }

    fn add_assistant_route(&mut self, _auth: Auth, add_user: AddUser, queue: &Queue) -> Result<()> {
        let conn = &self.get_db_connection();
        let admin = db::admins::create(conn, &queue.name, &add_user.username, AdminEnum::Teacher)?;
        self.send_self(
            &("addAssistant/".to_string() + &queue.name),
            json!(db::users::find(conn, admin.user_id)),
        );
        Ok(())
    }

    fn add_super_route(&mut self, _auth: Auth, add_user: AddUser, _queue: &Queue) -> Result<()> {
        let conn = &self.get_db_connection();
        let _admin = db::super_admins::create(conn, &add_user.username)?;
        Ok(())
    }

    fn add_queue(&mut self, _auth: Auth, _queue: &Queue) -> Result<()> {
        // let conn = &self.get_db_connection();
        // let _admin = db::super_admins::create(conn, &add_user.username)?;
        Ok(())
    }

    fn leave_queue_route(&mut self, auth: Auth, queue: &Queue) -> Result<()> {
        // let queue = self.current_queue.as_ref().ok_or_else(|| BadAuth)?.clone();
        // println!("Leaving queue: {}", &queue.name);
        let conn = &self.get_db_connection();
        db::queue_entries::remove(&conn, queue.id, auth.id)?;
        self.broadcast_room(
            &queue.name,
            "leaveQueue",
            json!({ "ugkthid": &auth.ugkthid }),
        );
        Ok(())
    }

    fn getting_help_route(
        &mut self,
        auth: Auth,
        getting_help: GettingHelp,
        queue: &Queue,
    ) -> Result<()> {
        let conn = &self.get_db_connection();
        db::queue_entries::update_help_status(&conn, queue.id, auth.id, getting_help.status)?;
        self.broadcast_room(&queue.name, "gettingHelp", json!(getting_help));
        Ok(())
    }

    fn join_queue_route(&mut self, auth: Auth, join_queue: JoinQueue, queue: &Queue) -> Result<()> {
        println!("Joining queue: {}", &queue.name);
        let conn = &self.get_db_connection();
        let queue_entry = queue_entries::create(
            &conn,
            auth.id,
            queue.id,
            &join_queue.location,
            &join_queue.comment,
        )?;
        println!("QueueEntry ID: {}", queue_entry.id);

        self.broadcast_room(
            &queue.name,
            "joinQueue",
            json!(queue_entry.to_sendable(conn)),
        );
        Ok(())
    }

    fn send_self(&self, path: &str, content: Json) {
        let message = &json!(SendWrapper {
            path: path.to_string(),
            content: content,
        })
        .to_string();
        self.out.send(Message::Text(message.to_string())).unwrap();
    }

    fn broadcast_room(&self, room: &str, path: &str, content: Json) {
        let rooms = self.rooms.borrow();
        println!("broadcasting in room: {}", room);
        let internal_name = "room_".to_string() + room;
        let message = &json!(SendWrapper {
            path: path.to_string() + "/" + room,
            content: content,
        })
        .to_string();
        for sender in &rooms[&internal_name] {
            // TODO deal with errors
            println!("Sending: '{}' to {}", &message, sender.connection_id());
            sender.send(Message::Text(message.to_string())).unwrap();
        }
    }

    fn join_room(&mut self, room_name: &str) -> Result<()> {
        // let conn = &self.get_db_connection();
        // let queue = db::queues::find_by_name(conn, room_name)?;
        let internal_name = "room_".to_string() + room_name;
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry(internal_name.clone()).or_insert_with(Vec::new);
        rooms
            .get_mut(&internal_name)
            .unwrap()
            .push(self.out.clone());
        println!(
            "Joining room: {}, {}",
            &internal_name,
            self.out.connection_id()
        );
        // self.current_queue = Some(queue);
        Ok(())
    }

    fn join_lobby(&mut self) -> Result<()> {
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry("lobby".to_string()).or_insert_with(Vec::new);
        rooms.get_mut("lobby").unwrap().push(self.out.clone());
        println!("Joining lobby",);
        // TODO join the lobby struct
        Ok(())
    }

    fn leave_room(&mut self) {
        //println!("Leaving room");
        //if let Some(queue) = &self.current_queue {
        //    let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        //    //TODO won't be needed soon?
        //    rooms.entry(queue.name.clone()).or_insert_with(Vec::new);
        //    rooms
        //        .get_mut(&queue.name)
        //        .unwrap()
        //        .retain(|x| x != &self.out);
        //}
        //self.current_queue = None;
    }
}

pub fn websocket() -> () {
    println!("Web Socket RoomHandler is ready at ws://127.0.0.1:7777/ws");
    println!("RoomHandler is ready at http://127.0.0.1:7777/");

    // Listen on an address and call the closure for each connection
    let count = Rc::new(Cell::new(0));
    let rooms: Rc<RefCell<HashMap<String, Vec<Sender>>>> = Rc::new(RefCell::new(HashMap::new()));
    let pool: Rc<RefCell<db::PgPool>> = Rc::new(RefCell::new(db::init_pool()));
    listen("127.0.0.1:7777", |out| RoomHandler {
        out: out,
        count: count.clone(),
        rooms: rooms.clone(),
        secret: get_secret().into_bytes(),
        pool: pool.clone(),
    })
    .unwrap()
}
