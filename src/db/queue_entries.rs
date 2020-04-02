use crate::models::queue_entry::QueueEntry;
use crate::schema::queue_entries;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};

pub enum QueueEntryCreationError {
    DuplicatedName,
}

impl From<Error> for QueueEntryCreationError {
    fn from(err: Error) -> QueueEntryCreationError {
        if let Error::DatabaseError(DatabaseErrorKind::UniqueViolation, info) = &err {
            match info.constraint_name() {
                Some("users_username_key") => return QueueEntryCreationError::DuplicatedName,
                _ => {}
            }
        }
        panic!("Error creating user: {:?}", err)
    }
}

// pub fn all( conn: &PgConnection) -> Vec<Queue> {
//     queues::table.load::<Queue>(&*conn)
//         .expect("Could not get queues")
// }

// pub fn get(id: i32, connection: &PgConnection) -> QueryResult<Queue> {
//     queues::table.find(id).get_result::<Queue>(connection)
// }

pub fn create(
    conn: &PgConnection,
    user_id: i32,
    queue_id: i32,
    location: &str,
    usercomment: &str,
) -> Result<QueueEntry, diesel::result::Error> {
    let new_queue = &NewQueueEntry {
        user_id,
        queue_id,
        location,
        usercomment,
    };

    diesel::insert_into(queue_entries::table)
        .values(new_queue)
        .get_result::<QueueEntry>(conn)
        .map_err(Into::into)
}

#[derive(Insertable)]
#[table_name = "queue_entries"]
pub struct NewQueueEntry<'a> {
    user_id: i32,
    queue_id: i32,
    location: &'a str,
    usercomment: &'a str,
}
