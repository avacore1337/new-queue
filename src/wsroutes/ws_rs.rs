use ws::{listen, CloseCode, Handler, Handshake, Message, Request, Response, Sender};

use crate::auth::{decode_token, Auth};
use crate::config::get_secret;
use crate::db;
use crate::db::queue_entries;
use crate::models::queue::Queue;
use crate::sql_types::AdminEnum;
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
        "User is not logged in"
    }

    fn cause(&self) -> Option<&(dyn error::Error)> {
        // Generic error, underlying cause isn't tracked.
        None
    }
}

use serde_json::Value as Json;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Wrapper {
    path: String,
    content: Json,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct SubscribeQueue {
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
struct AddUser {
    queue: String,
    username: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct JoinQueue {
    comment: String,
    help: bool,
    location: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Kick {
    ugkthid: String,
}

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

    fn auth<F>(&mut self, fun: F, auth_level: AuthLevel) -> Result<()>
    where
        F: Fn(&mut Self, Auth) -> Result<()>,
    {
        let auth = self.get_auth(auth_level)?;
        fun(self, auth)
    }

    fn get_auth(&mut self, auth_level: AuthLevel) -> Result<Auth> {
        match self.auth.clone() {
            Some(auth) => match auth_level {
                AuthLevel::Any => Ok(auth),
                AuthLevel::Assistant => Ok(auth), //TODO
                AuthLevel::Teacher => Ok(auth),   //TODO
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
            "/subscribeQueue" => self.deserialize(wrapper, RoomHandler::subscribe_queue_route),
            "/subscribeLobby" => self.subscribe_lobby_route(),
            "/login" => self.deserialize(wrapper, RoomHandler::login_route),
            "/logout" => self.logout_route(),
            "/unsubscribeQueue" => self.unsubscribe_queue_route(),
            "/unsubscribeLobby" => self.unsubscribe_queue_route(),
            "/joinQueue" => {
                self.auth_deserialize(wrapper, RoomHandler::join_queue_route, AuthLevel::Any)
            }
            "/leaveQueue" => self.auth(RoomHandler::leave_queue_route, AuthLevel::Any),
            "/kick" => {
                self.auth_deserialize(wrapper, RoomHandler::kick_route, AuthLevel::Assistant)
            }
            "/addTeacher" => {
                self.auth_deserialize(wrapper, RoomHandler::add_teacher_route, AuthLevel::Teacher)
            }
            "/addAssistant" => self.auth_deserialize(
                wrapper,
                RoomHandler::add_assistant_route,
                AuthLevel::Teacher,
            ),
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

    fn subscribe_queue_route(&mut self, join: SubscribeQueue) -> Result<()> {
        println!("joining room {}", &join.room);
        self.join_room(&join.room)
    }

    fn subscribe_lobby_route(&mut self) -> Result<()> {
        println!("joining lobby ");
        self.join_lobby()
    }

    fn unsubscribe_queue_route(&mut self) -> Result<()> {
        self.leave_room();
        Ok(())
    }

    fn kick_route(&mut self, _auth: Auth, _kick: Kick) -> Result<()> {
        Ok(())
    }

    fn add_teacher_route(&mut self, _auth: Auth, add_user: AddUser) -> Result<()> {
        let conn = &self.get_db_connection();
        let _admin = db::admins::create(
            conn,
            &add_user.queue,
            &add_user.username,
            AdminEnum::Teacher,
        )?;
        Ok(())
    }

    fn add_assistant_route(&mut self, _auth: Auth, add_user: AddUser) -> Result<()> {
        let conn = &self.get_db_connection();
        let _admin = db::admins::create(
            conn,
            &add_user.queue,
            &add_user.username,
            AdminEnum::Teacher,
        )?;
        Ok(())
    }

    fn leave_queue_route(&mut self, auth: Auth) -> Result<()> {
        let queue = self
            .current_queue
            .as_ref()
            .ok_or_else(|| NotLoggedInError)?
            .clone();
        println!("Leaving queue: {}", &queue.name);
        let conn = &self.get_db_connection();
        db::queue_entries::remove(&conn, queue.id, auth.id)?;
        self.broadcast_room(
            &queue.name,
            &json!({"path": "/leaveQueue/".to_string() + &queue.name,
                "content": { "ugkthid": &auth.ugkthid }
            })
            .to_string(),
        );
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
            &json!({"path": "/joinQueue/".to_string() + &queue.name,
                "content": queue_entry.to_sendable(conn)
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

    fn join_room(&mut self, room_name: &str) -> Result<()> {
        let conn = &self.get_db_connection();
        let queue = db::queues::find_by_name(conn, room_name)?;
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
        self.current_queue = Some(queue);
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
}

pub fn websocket() -> () {
    println!("Web Socket RoomHandler is ready at ws://127.0.0.1:7777/ws");
    println!("RoomHandler is ready at http://127.0.0.1:7777/");

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
