use crate::schema::queues;
use serde::Serialize;

#[derive(Identifiable, Queryable, Serialize, Clone)]
pub struct Queue {
    pub id: i32,
    pub name: String,
    pub locked: bool,
    pub hiding: bool,
    pub motd: String,
    pub info: String,
}
