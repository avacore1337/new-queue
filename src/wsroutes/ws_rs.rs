use ws::{listen, CloseCode, Handler, Handshake, Message, Request, Response, Sender};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
use crate::db;
use crate::sql_types::AdminEnum;
use crate::wsroutes::routes::*;
use crate::wsroutes::*;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, from_value, json};
use std::cell::{Cell, RefCell, RefMut};
use std::collections::HashMap;
use std::rc::Rc;
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

enum AuthLevel {
    Any,
    Assistant,
    Teacher,
    SuperOrTeacher,
    Super,
}

use serde_json::Value as Json;

#[derive(Deserialize, Debug, Clone)]
struct Wrapper {
    path: String,
    token: String,
    content: Json,
}

#[derive(Serialize, Debug, Clone)]
struct SendWrapper {
    path: String,
    content: Json,
}

pub struct RoomHandler {
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

    // fn auth_deserialize<T, F>(
    //     &mut self,
    //     wrapper: Wrapper,
    //     room_name: &str,
    //     fun: F,
    //     auth_level: AuthLevel,
    // ) -> Result<()>
    // where
    //     T: for<'de> serde::Deserialize<'de>,
    //     F: Fn(&mut Self, Auth, T, &Queue) -> Result<()>,
    // {
    //     let v = from_value::<T>(wrapper.content.clone())?;
    //     let conn = &self.get_db_connection();
    //     let queue = db::queues::find_by_name(conn, room_name)?;
    //     let auth = self.get_auth(&wrapper, auth_level)?;
    //     fun(self, auth, v, &queue)
    // }

    fn get_auth(&mut self, wrapper: &Wrapper, auth_level: AuthLevel) -> Result<Auth> {
        let token = &wrapper.token;

        let queue_name = match wrapper.path.split('/').collect::<Vec<&str>>().as_slice() {
            [_, queue_name] => Some(queue_name.to_string()),
            _ => None,
        };
        let conn = &self.get_db_connection();
        match decode_token(token, &self.secret) {
            Some(auth) => match auth_level {
                AuthLevel::Any => Ok(auth),
                AuthLevel::Assistant => {
                    let queue_name = queue_name.ok_or_else(|| BadAuth)?;
                    match db::admins::admin_for_queue(conn, &queue_name, &auth) {
                        Some(_) => Ok(auth),
                        None => Err(Box::new(BadAuth)),
                    }
                }
                AuthLevel::Teacher => {
                    let queue_name = queue_name.ok_or_else(|| BadAuth)?;
                    match db::admins::admin_for_queue(conn, &queue_name, &auth) {
                        Some(AdminEnum::Teacher) => Ok(auth),
                        _ => Err(Box::new(BadAuth)),
                    }
                }
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

        let conn = &self.get_db_connection();
        let path = wrapper.path.clone();
        match path.split('/').collect::<Vec<&str>>().as_slice() {
            ["subscribeLobby"] => self.subscribe_lobby_route(),
            // "/logout" => self.logout_route(),
            ["unsubscribeLobby"] => self.unsubscribe_lobby_route(),
            ["unsubscribeQueue", queue_name] => self.unsubscribe_queue_route(queue_name),
            ["subscribeQueue", queue_name] => self.subscribe_queue_route(queue_name),
            ["updateQueueEntry", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Any)?;
                let join_queue = from_value::<QueueEntry>(wrapper.content.clone())?;
                update_queue_entry_route(self, auth, conn, join_queue, queue_name)
            }
            ["SendMessage", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Assistant)?;
                let user_message = from_value::<UserMessage>(wrapper.content.clone())?;
                send_message_route(self, auth, user_message, queue_name)
            }
            ["joinQueue", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Any)?;
                let join_queue = from_value::<QueueEntry>(wrapper.content.clone())?;
                join_queue_route(self, auth, conn, join_queue, queue_name)
            }
            ["leaveQueue", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Any)?;
                leave_queue_route(self, auth, conn, queue_name)
            }
            ["addQueue", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Super)?;
                add_queue_route(self, auth, conn, queue_name)
            }
            ["addSuperAdmin"] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Super)?;
                let user = from_value::<AddUser>(wrapper.content.clone())?;
                add_super_route(self, auth, conn, user)
            }
            ["gettingHelp", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Any)?;
                let getting_help = from_value::<GettingHelp>(wrapper.content.clone())?;
                getting_help_route(self, auth, conn, getting_help, queue_name)
            }
            ["kick", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::Assistant)?;
                let kick = from_value::<Kick>(wrapper.content.clone())?;
                kick_route(self, auth, conn, kick, queue_name)
            }
            ["addTeacher", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::SuperOrTeacher)?;
                let user = from_value::<AddUser>(wrapper.content.clone())?;
                add_teacher_route(self, auth, conn, user, queue_name)
            }
            ["addAssistant", queue_name] => {
                let auth = self.get_auth(&wrapper, AuthLevel::SuperOrTeacher)?;
                let user = from_value::<AddUser>(wrapper.content.clone())?;
                add_assistant_route(self, auth, conn, user, queue_name)
            }
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

    fn unsubscribe_queue_route(&mut self, _queue_name: &str) -> Result<()> {
        self.leave_room();
        Ok(())
    }

    fn unsubscribe_lobby_route(&mut self) -> Result<()> {
        self.leave_room();
        Ok(())
    }

    pub fn send_user_message(
        &mut self,
        _queue_name: &str,
        _ugkthid: &str,
        _message: &str,
        _sender_name: &str,
    ) {
        // let message = &json!(SendWrapper {
        //     path: path.to_string(),
        //     content: content,
        // })
        // .to_string();
        // self.out.send(Message::Text(message.to_string())).unwrap();
    }

    pub fn send_self(&self, path: &str, content: Json) {
        let message = &json!(SendWrapper {
            path: path.to_string(),
            content: content,
        })
        .to_string();
        self.out.send(Message::Text(message.to_string())).unwrap();
    }

    pub fn broadcast_room(&self, room: &str, path: &str, content: Json) {
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
