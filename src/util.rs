use crate::db::queue_entries::remove_all;
use diesel::pg::PgConnection;
// use diesel::prelude::*;

pub fn cleanup(conn: &PgConnection) {
    if let Err(e) = remove_all(conn) {
        println!("Something went wrong! {}", e);
    }
}
