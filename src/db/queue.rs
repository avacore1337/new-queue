use serde::{Serialize, Deserialize};
use crate::schema::queues;

use diesel;
use diesel::prelude::*;

pub fn all(connection: &PgConnection) -> QueryResult<Vec<Queue>> {
    queues::table.load::<Queue>(&*connection)
}

pub fn get(id: i32, connection: &PgConnection) -> QueryResult<Queue> {
    queues::table.find(id).get_result::<Queue>(connection)
}

pub fn insert(queue: Queue, connection: &PgConnection) -> QueryResult<Queue> {
    diesel::insert_into(queues::table)
        .values(&NewQueue::from_queue(queue))
        .get_result(connection)
}

pub fn new_insert(queue: NewQueue, connection: &PgConnection) -> QueryResult<Queue> {
    diesel::insert_into(queues::table)
        .values(queue)
        .get_result(connection)
}

#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
pub struct Queue {
        pub id: i32,
        pub name: String,
        pub locked : bool,
        pub hiding : bool,
        pub motd: String,
        pub info : String,
  }

#[derive(Insertable, Deserialize)]
#[table_name = "queues"]
pub struct NewQueue {
        name: String,
}

impl NewQueue {

    fn from_queue(queue: Queue) -> NewQueue {
        NewQueue {
            name: queue.name,
        }
    }
}

