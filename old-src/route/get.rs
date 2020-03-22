extern crate chat;
use self::db::queue::*;
use diesel::result::Error;
use std::env;
use rocket::http::Status;
use rocket_contrib::json::Json;

use std::io;
use rocket::response::{NamedFile};
use self::chat::*;
use self::models::*;

fn error_status(error: Error) -> Status {
    match error {
        Error::NotFound => Status::NotFound,
        _ => Status::InternalServerError
    }
}

#[get("/")]
pub fn index() -> &'static str {
   "Build a Rust chat app with Steadylearner(Visit http://localhost:8000/chat)"
}

#[get("/chat")]
pub fn chat() -> io::Result<NamedFile> {
    NamedFile::open("static/chat/index.html")
}

#[get("/queues")]
pub fn queues() -> Result<Json<Vec<Queue>>, Status> {
    let connection = establish_connection();
    all(&connection)
        .map(|queues| Json(queues))
        .map_err(|error| error_status(error))
}

#[get("/queues/<id>")]
pub fn queue(id: i32) -> Result<Json<Queue>, Status> {
    let connection = establish_connection();
    self::db::queue::get(id, &connection)
        .map(|queue| Json(queue))
        .map_err(|error| error_status(error))
}




