//extern crate diesel;
use ws::{
    listen, CloseCode, Error, Handler, Handshake, Message, Request, Response, Result, Sender,
};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
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
                Err(e) => self.send_error_message(e, message),
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
    fn send_error_message(&mut self, e: serde_json::error::Error, message: Message) {
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
            "/join" => self.join_route(wrapper),
            "/login" => self.login_route(wrapper),
            "/logout" => self.logout_route(wrapper),
            "/leave" => self.leave_route(wrapper),
            "/joinQueue" => self.join_queue_route(wrapper),
            // 3 => println!("three"),
            _ => println!("Unknown message"),
        }
    }

    fn login_route(&mut self, wrapper: Wrapper) {
        println!("attempting join");
        match from_value::<Login>(wrapper.content.clone()) {
            Ok(login) => {
                println!("login");
                self.auth = decode_token(&login.token, &self.secret);
                if let Some(auth) = &self.auth {
                    println!("Logged in as {}", auth.username)
                }
            }
            Err(e) => println!("Error Deserializing: {:?}", e),
        }
    }

    fn logout_route(&mut self, _wrapper: Wrapper) {
        println!("Logged out");
        self.auth = Option::None;
    }

    fn join_route(&mut self, wrapper: Wrapper) {
        println!("attempting join");
        match from_value::<Join>(wrapper.content.clone()) {
            Ok(join) => {
                println!("joining");
                self.join_room(join.room);
            }
            Err(e) => println!("Error Deserializing: {:?}", e),
        }
    }

    fn leave_route(&mut self, _wrapper: Wrapper) {
        println!("attempting leaving");
        println!("Leaving");
        self.leave_room(self.room_name.clone());
    }

    fn join_queue_route(&mut self, wrapper: Wrapper) {
        println!("attempting leaving");
        if let Ok(join_queue) = from_value::<JoinQueue>(wrapper.content.clone()) {
            println!("User is joining Queue");
            // self.update database with joining queue
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
    listen("127.0.0.1:7777", |out| RoomHandler {
        out: out,
        count: count.clone(),
        rooms: rooms.clone(),
        room_name: "".to_string(),
        secret: get_secret().into_bytes(),
        auth: Option::None,
    })
    .unwrap()
}
