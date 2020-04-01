//extern crate diesel;
use ws::{
    listen, CloseCode, Error, Handler, Handshake, Message, Request, Response, Result, Sender,
};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
use crate::db;
use crate::db::queue_entries;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, from_value, json};
use std::cell::{Cell, RefCell, RefMut};
use std::collections::HashMap;
use std::rc::Rc;

// use self::chat::*;
// use self::models::*;
// use self::diesel::prelude::*;

use serde_json::Value as Json;
// #[macro_use] serde_json::json!;

// type MessageLog = Rc<RefCell<Vec<LogMessage>>>;
// type Users = Rc<RefCell<HashSet<String>>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Wrapper {
    path: String,
    content: Json,
}

// #[derive(Serialize, Deserialize, Debug, Clone)]
// struct Message {
//     nick: String,
//     message: String,
// }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Join {
    room: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Leave {
    room: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Login {
    token: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct LogMessage {
    nick: String,
    sent: Option<i64>,
    message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct JoinQueue {
    comment: String,
    help: bool,
    location: String,
}
// RoomHandler web application handler
struct RoomHandler {
    out: Sender,
    count: Rc<Cell<u32>>,
    rooms: Rc<RefCell<HashMap<String, Vec<Sender>>>>,
    room_name: String,
    secret: Vec<u8>,
    auth: Option<Auth>,
    pool: Rc<RefCell<db::Pool>>,
}

impl Handler for RoomHandler {
    fn on_request(&mut self, req: &Request) -> Result<Response> {
        match req.resource() {
            "/ws" => {
                // used once for const socket = new WebSocket("ws://" + window.location.host + "/ws");
                // https://blog.stanko.io/do-you-really-need-websockets-343aed40aa9b
                // and no need for reconnect later

                // https://ws-rs.org/api_docs/ws/struct.Request.html
                println!("Browser Request from {:?}", req.origin().unwrap().unwrap());
                println!("Client found is {:?}", req.client_addr().unwrap());
                let resp = Response::from_request(req);
                // println!("{:?} \n", &resp);
                resp
            }

            _ => Ok(Response::new(404, "Not Found", b"404 - Not Found".to_vec())),
        }
    }

    fn on_open(&mut self, handshake: Handshake) -> Result<()> {
        // We have a new connection, so we increment the connection counter
        self.count.set(self.count.get() + 1);
        let number_of_connection = self.count.get();
        //
        // The most important part and used to assign id for clients
        // println!("{}", &handshake.local_addr.unwrap());
        let open_message = format!(
            "{} entered and the number of live connections is {}",
            &handshake.peer_addr.unwrap(),
            &number_of_connection
        );

        println!("{}", &open_message);
        // self.out.broadcast(open_message).unwrap();
        // self.join_room("test_room".to_string());

        Ok(())
    }

    // Handle messages recieved in the websocket (in this case, only on /ws)
    fn on_message(&mut self, message: Message) -> Result<()> {
        let raw_message = message.clone().into_text()?;
        println!("The message from the client is {:#?}", &raw_message);
        if let Ok(text_msg) = message.clone().as_text() {
            println!("text_msg {:#?}", &text_msg);
            match from_str::<Wrapper>(text_msg) {
                Ok(wrapper) => self.route_wrapper(wrapper),
                Err(e) => self.send_error_message(e, text_msg),
            }
        }
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
        self.count.set(self.count.get() - 1)
    }

    fn on_error(&mut self, err: Error) {
        println!("The RoomHandler encountered an error: {:?}", err);
    }
}

impl RoomHandler {
    fn get_db_connection(&mut self) -> db::DbConn {
        let mut pool: RefMut<_> = self.pool.borrow_mut();
        let conn = pool.get().unwrap();
        db::DbConn(conn)
    }

    fn deserialize<T, F>(&mut self, wrapper: Wrapper, fun: F)
    where
        T: for<'de> serde::Deserialize<'de>,
        F: Fn(&mut Self, T),
    {
        match from_value::<T>(wrapper.content.clone()) {
            Ok(v) => fun(self, v),
            Err(e) => {
                println!("Error Deserializing: {:?}", e);
                self.send_error_message(e, &wrapper.content.to_string());
            }
        }
    }

    fn send_error_message(&mut self, e: serde_json::error::Error, message: &str) {
        let _ = self.out.send(
            json!({
                "path": "/error",
                "content": format!("Unable to parse message {:?}, got error {:?}", message, e),
            })
            .to_string(),
        );
    }

    fn route_wrapper(&mut self, wrapper: Wrapper) {
        println!("wrapper.path {:#?}", &wrapper.path);
        println!("wrapper.content {:#?}", &wrapper.content);
        match wrapper.path.as_str() {
            "/join" => self.deserialize(wrapper, RoomHandler::join_route),
            "/login" => self.deserialize(wrapper, RoomHandler::login_route),
            "/logout" => self.logout_route(),
            "/leave" => self.leave_route(),
            "/joinQueue" => self.deserialize(wrapper, RoomHandler::join_queue_route),
            // 3 => println!("three"),
            _ => println!("Unknown message"),
        }
    }

    fn login_route(&mut self, login: Login) {
        self.auth = decode_token(&login.token, &self.secret);
        if let Some(auth) = &self.auth {
            println!("Logged in as {}", auth.username)
        }
    }

    fn logout_route(&mut self) {
        println!("Logged out");
        self.auth = Option::None;
    }

    fn join_route(&mut self, join: Join) {
        println!("joining");
        self.join_room(join.room);
    }

    fn leave_route(&mut self) {
        println!("attempting leaving");
        println!("Leaving");
        self.leave_room(self.room_name.clone());
    }

    fn join_queue_route(&mut self, join_queue: JoinQueue) {
        // pub fn create(
        //     conn: &PgConnection,
        //     user_id: i32,
        //     queue_id: i32,
        //     location: &str,
        //     usercomment: &str,
        queue_entries::create(
            &self.get_db_connection(),
            1,
            // self.auth.user_id,
            1,
            &join_queue.location,
            &join_queue.comment,
        );
        self.broadcast_room(
            self.room_name.clone(),
            &json!({"path": "join/".to_string() + &self.room_name,
                "content": {
                "location": join_queue.location,
                "help": join_queue.help,
                "comment": join_queue.comment,
                }
            })
            .to_string(),
        );
    }

    fn broadcast_room(&mut self, room: String, message: &str) {
        let rooms: RefMut<_> = self.rooms.borrow_mut();
        println!("broadcasting room: {}", room);
        for sender in &rooms[&room] {
            // TODO
            // send?
            // TODO deal with errors
            println!("Sending: '{}' to {}", &message, sender.connection_id());
            sender.send(Message::Text(message.to_string())).unwrap();
        }
    }

    fn join_room(&mut self, room: String) {
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry(room.clone()).or_insert_with(Vec::new);
        rooms.get_mut(&room).unwrap().push(self.out.clone());
        println!("Joining room: {}, {}", &room, self.out.connection_id());
        self.room_name = room;
    }

    fn leave_room(&mut self, room: String) {
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry(room.clone()).or_insert_with(Vec::new);
        rooms.get_mut(&room).unwrap().retain(|x| x != &self.out);
        self.room_name = "".to_string();
        println!("Leaving room: {}, {}", room, self.out.connection_id());
    }
    //     fn send(&mut self, message: String, name: String) {
    //         let id = self.members[&name];
    //             // TODO
    //             // send?
    //             println!("{}, {}", id, message);
    //     }
}

pub fn websocket() -> () {
    println!("Web Socket RoomHandler is ready at ws://127.0.0.1:7777/ws");
    println!("RoomHandler is ready at http://127.0.0.1:7777/");

    // Rc is a reference-counted box for sharing the count between handlers
    // since each handler needs to own its contents.
    // Cell gives us interior mutability so we can increment
    // or decrement the count between handlers.

    // Listen on an address and call the closure for each connection
    let count = Rc::new(Cell::new(0));
    let rooms: Rc<RefCell<HashMap<String, Vec<Sender>>>> = Rc::new(RefCell::new(HashMap::new()));
    let pool: Rc<RefCell<db::Pool>> = Rc::new(RefCell::new(db::init_pool()));
    listen("127.0.0.1:7777", |out| RoomHandler {
        out: out,
        count: count.clone(),
        rooms: rooms.clone(),
        room_name: "".to_string(),
        secret: get_secret().into_bytes(),
        auth: Option::None,
        pool: pool.clone(),
    })
    .unwrap()
}
