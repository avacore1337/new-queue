use crate::models::queue::Queue;
use crate::schema::queues;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};

pub enum QueueCreationError {
    DuplicatedName,
}

impl From<Error> for QueueCreationError {
    fn from(err: Error) -> QueueCreationError {
        if let Error::DatabaseError(DatabaseErrorKind::UniqueViolation, info) = &err {
            match info.constraint_name() {
                Some("users_username_key") => return QueueCreationError::DuplicatedName,
                _ => {}
            }
        }
        panic!("Error creating user: {:?}", err)
    }
}

pub fn all(conn: &PgConnection) -> Vec<Queue> {
    queues::table
        .load::<Queue>(&*conn)
        .expect("Could not get queues")
}

// pub fn get(id: i32, connection: &PgConnection) -> QueryResult<Queue> {
//     queues::table.find(id).get_result::<Queue>(connection)
// }

pub fn create(conn: &PgConnection, name: &str) -> Result<Queue, QueueCreationError> {
    let new_queue = &NewQueue { name };

    diesel::insert_into(queues::table)
        .values(new_queue)
        .get_result::<Queue>(conn)
        .map_err(Into::into)
}

#[derive(Insertable)]
#[table_name = "queues"]
pub struct NewQueue<'a> {
    name: &'a str,
}
