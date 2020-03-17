extern crate chat;
use diesel::result::Error;
use std::env;
use rocket::http::Status;
use rocket_contrib::json::Json;

use rocket::response::{status};
use self::chat::*;
use self::models::*;

fn error_status(error: Error) -> Status {
    match error {
        Error::NotFound => Status::NotFound,
        _ => Status::InternalServerError
    }
}


fn host() -> String {
    env::var("ROCKET_ADDRESS").expect("ROCKET_ADDRESS must be set")
}

fn port() -> String {
    env::var("ROCKET_PORT").expect("ROCKET_PORT must be set")
}

#[post("/queue", format = "application/json", data = "<newqueue>")]
pub fn queue(newqueue: Json<NewQueue>) -> Result<status::Created<Json<Queue>>, Status> {
    let connection = establish_connection();
    new_insert(newqueue.into_inner(), &connection)
        .map(|queue| queue_created(queue))
        .map_err(|error| error_status(error))
}

fn queue_created(queue: Queue) -> status::Created<Json<Queue>> {
    status::Created(
        format!("{host}:{port}/queues/{id}", host = host(), port = port(), id = queue.id).to_string(),
        Some(Json(queue)))
}
