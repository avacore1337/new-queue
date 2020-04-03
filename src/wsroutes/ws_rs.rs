use ws::{listen, CloseCode, Handler, Handshake, Message, Request, Response, Sender};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
use crate::db;
use crate::db::{queue_entries, queues};
use crate::models::queue::Queue;
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
}

// Change the alias to `Box<error::Error>`.
type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Debug, Clone)]
struct NotLoggedInError;

impl fmt::Display for NotLoggedInError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "User is not logged in but attempted to do action that requires login data"
        )
    }
}

impl error::Error for NotLoggedInError {
    fn description(&self) -> &str {
        "invalid first item to double"
    }

    fn cause(&self) -> Option<&(dyn error::Error)> {
        // Generic error, underlying cause isn't tracked.
        None
    }
}

use serde_json::Value as Json;
// #[macro_use] serde_json::json!;

// type Users = Rc<RefCell<HashSet<String>>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Wrapper {
    path: String,
    content: Json,
}

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
    current_queue: Option<Queue>,
    secret: Vec<u8>,
    auth: Option<Auth>,
    pool: Rc<RefCell<db::Pool>>,
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

    fn deserialize<T, F>(&mut self, wrapper: Wrapper, fun: F) -> Result<()>
    where
        T: for<'de> serde::Deserialize<'de>,
        F: Fn(&mut Self, T) -> Result<()>,
    {
        let v = from_value::<T>(wrapper.content.clone())?;
        fun(self, v)
    }

    fn auth_deserialize<T, F>(
        &mut self,
        wrapper: Wrapper,
        fun: F,
        auth_level: AuthLevel,
    ) -> Result<()>
    where
        T: for<'de> serde::Deserialize<'de>,
        F: Fn(&mut Self, Auth, T) -> Result<()>,
    {
        let v = from_value::<T>(wrapper.content.clone())?;
        let auth = self.get_auth(auth_level)?;
        fun(self, auth, v)
    }

    fn get_auth(&mut self, auth_level: AuthLevel) -> Result<Auth> {
        match self.auth.clone() {
            Some(auth) => match auth_level {
                AuthLevel::Any => Ok(auth),
                AuthLevel::Assistant => Ok(auth),
                AuthLevel::Teacher => Ok(auth),
            },
            None => Err(Box::new(NotLoggedInError)),
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
        match wrapper.path.as_str() {
            "/join" => self.deserialize(wrapper, RoomHandler::join_route),
            "/login" => self.deserialize(wrapper, RoomHandler::login_route),
            "/logout" => self.logout_route(),
            "/leave" => self.leave_route(),
            "/joinQueue" => {
                self.auth_deserialize(wrapper, RoomHandler::join_queue_route, AuthLevel::Any)
            }
            _ => Ok(()),
        }
    }

    fn login_route(&mut self, login: Login) -> Result<()> {
        println!("Logged in");
        self.auth = decode_token(&login.token, &self.secret);
        if let Some(auth) = &self.auth {
            println!("Logged in as {}", auth.username)
        }
        Ok(())
    }

    fn logout_route(&mut self) -> Result<()> {
        println!("Logged out");
        self.auth = Option::None;
        Ok(())
    }

    fn join_route(&mut self, join: Join) -> Result<()> {
        println!("joining room {}", &join.room);
        self.join_room(join.room)
    }

    fn leave_route(&mut self) -> Result<()> {
        self.leave_room();
        Ok(())
    }

    fn join_queue_route(&mut self, auth: Auth, join_queue: JoinQueue) -> Result<()> {
        let queue = self
            .current_queue
            .as_ref()
            .ok_or_else(|| NotLoggedInError)?
            .clone();
        println!("Joining queue: {}", &queue.name);
        let conn = &self.get_db_connection();
        let queue_id = queues::name_to_id(&conn, &queue.name)?;
        println!("Joining queue with id: {}", &queue_id);
        let queue_entry = queue_entries::create(
            &conn,
            auth.id,
            queue_id,
            &join_queue.location,
            &join_queue.comment,
        )?;
        println!("QueueEntry ID: {}", queue_entry.id);

        self.broadcast_room(
            &queue.name,
            &json!({"path": "join/".to_string() + &queue.name,
                "content": {
                "location": join_queue.location,
                "help": join_queue.help,
                "comment": join_queue.comment,
                }
            })
            .to_string(),
        );
        Ok(())
    }

    fn broadcast_room(&self, room: &str, message: &str) {
        let rooms = self.rooms.borrow();
        println!("broadcasting in room: {}", room);
        for sender in &rooms[room] {
            // TODO deal with errors
            println!("Sending: '{}' to {}", &message, sender.connection_id());
            sender.send(Message::Text(message.to_string())).unwrap();
        }
    }

    fn join_room(&mut self, room_name: String) -> Result<()> {
        let conn = &self.get_db_connection();
        let queue = db::queues::find_by_name(conn, &room_name)?;
        let mut rooms: RefMut<_> = self.rooms.borrow_mut();
        rooms.entry(room_name.clone()).or_insert_with(Vec::new);
        rooms.get_mut(&room_name).unwrap().push(self.out.clone());
        println!("Joining room: {}, {}", &room_name, self.out.connection_id());
        self.current_queue = Some(queue);
        Ok(())
    }

    fn leave_room(&mut self) {
        println!("Leaving room");
        if let Some(queue) = &self.current_queue {
            let mut rooms: RefMut<_> = self.rooms.borrow_mut();
            //TODO won't be needed soon?
            rooms.entry(queue.name.clone()).or_insert_with(Vec::new);
            rooms
                .get_mut(&queue.name)
                .unwrap()
                .retain(|x| x != &self.out);
        }
        self.current_queue = None;
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
        current_queue: None,
        secret: get_secret().into_bytes(),
        auth: Option::None,
        pool: pool.clone(),
    })
    .unwrap()
}
