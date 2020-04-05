use crate::auth::Auth;
use crate::db::{self, queues::QueueCreationError};
use crate::errors::{Errors, FieldValidator};

use rocket_contrib::json::{Json, JsonValue};
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize)]
pub struct NewQueue {
    queue: NewQueueData,
}

#[derive(Deserialize, Validate)]
struct NewQueueData {
    #[validate(length(min = 1))]
    name: Option<String>,
}

#[post("/queues", format = "json", data = "<new_queue>")]
pub fn post_queues(
    _auth: Auth,
    new_queue: Json<NewQueue>,
    conn: db::DbConn,
) -> Result<JsonValue, Errors> {
    let new_queue = new_queue.into_inner().queue;

    let mut extractor = FieldValidator::validate(&new_queue);
    let name = extractor.extract("name", new_queue.name);

    extractor.check()?;

    db::queues::create(&conn, &name)
        .map(|queue| json!({ "queue": queue }))
        .map_err(|error| {
            let field = match error {
                QueueCreationError::DuplicatedName => "name",
            };
            Errors::new(&[(field, "already exists")])
        })
}

#[get("/queues")]
pub fn get_queues(conn: db::DbConn) -> JsonValue {
    json!({ "queues": db::queues::all(&conn) })
}

#[get("/queues/<queue_name>")]
pub fn get_queue(queue_name: String, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(db::queues::find_by_name(&conn, &queue_name).ok()?))
}
