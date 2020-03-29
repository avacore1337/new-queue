extern crate diesel;
use ws::{
    listen, CloseCode, Error, Handler, Handshake, Message, Request, Response, Result, Sender,
};

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
struct LogMessage {
    nick: String,
    sent: Option<i64>,
    message: String,
}

// RoomHandler web application handler
struct RoomHandler {
    out: Sender,
    count: Rc<Cell<u32>>,
    rooms: Rc<RefCell<HashMap<String, Vec<Sender>>>>,
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
            if let Ok(wrapper) = from_str::<Wrapper>(text_msg) {
                println!("wrapper.path {:#?}", &wrapper.path);
                println!("wrapper.content {:#?}", &wrapper.content);
                match wrapper.path.as_str() {
                    "/join" => {
                        println!("attempting join");
                        match from_value::<Join>(wrapper.content.clone()) {
                            Ok(join) => {
                                println!("joining");
                                self.join_room(join.room);
                            }
                            Err(e) => println!("Error Deserializing: {:?}", e),
                        }
                    }
                    "/leave" => {
                        println!("attempting leaving");
                        if let Ok(leave) = from_value::<Leave>(wrapper.content.clone()) {
                            println!("Leaving");
                            self.leave_room(leave.room);
                        }
                    }
                    // 3 => println!("three"),
                    _ => println!("anything"),
                }
                // if let Ok(simple_msg) = serde_json::from_value::<Message>(wrapper.content.clone()) {
                //     self.message_log.borrow_mut().push(simple_msg.into_log());
                //     return self.out.broadcast(msg)
                // }

                // if let Ok(join) = serde_json::from_value::<Join>(wrapper.content.clone()) {
                //     if self.users.borrow().contains(&join.join_nick) {
                //         return self.out.send(format!("{:?}", json!({
                //             "path": "/error",
                //             "content": "A user by that name already exists.",
                //         })))
                //     }

                //     let join_msg = Message {
                //         nick: "system".into(),
                //         message: format!("{} has joined the chat.", join.join_nick),
                //     };
                //     self.users.borrow_mut().insert(join.join_nick.clone());
                //     self.nick = Some(join.join_nick);
                //     self.message_log.borrow_mut().push(join_msg.clone().into_log());
                //     return self.out.broadcast(format!("{:?}", json!({
                //         "path": "/joined",
                //         "content": join_msg,
                //     })))
                // }
            }
        }
        self.out.send(
            json!({
                "path": "/error",
                "content": format!("Unable to parse message {:?}", message),
            })
            .to_string(),
        )
        // use chat::schema::posts::dsl::*;
        // let raw_message = message.into_text()?;
        // println!("The message from the client is {:#?}", &raw_message);

        // let connection = establish_connection();
        // create_post(&connection, "fake", &raw_message);
        // let results = posts.filter(published.eq(false))
        //     .limit(5)
        //     .load::<Post>(&connection)
        //     .expect("Error loading posts");

        // println!("Displaying {} posts", results.len());
        // for post in results {
        //     println!("{}", post.title);
        //     println!("----------\n");
        //     println!("{}", post.body);
        // }

        // self.broadcast_room("test_room", &raw_message);
        // let message = if raw_message.contains("!warn") {
        //     let warn_message = "One of the clients sent warning to the RoomHandler.";
        //     println!("{}", &warn_message);
        //     Message::Text("There was warning from another user.".to_string())
        // } else {
        //     Message::Text(raw_message)
        // };

        // Broadcast to all connections
        // self.out.broadcast(message)
        // Ok(())
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
    fn broadcast_room(&mut self, room: &str, message: &str) {
        let rooms: RefMut<_> = self.rooms.borrow_mut();
        println!("broadcasting room: {}", room);
        for sender in &rooms[room] {
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
        println!("Joining room: {}, {}", room, self.out.connection_id());
    }

    fn leave_room(&mut self, room: String) {
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry(room.clone()).or_insert_with(Vec::new);
        rooms.get_mut(&room).unwrap().retain(|x| x != &self.out);
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
    })
    .unwrap()
}
