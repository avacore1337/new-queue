use crate::db::queue_entries::remove_all;
use diesel::pg::PgConnection;
// use diesel::prelude::*;

pub fn cleanup(conn: &PgConnection) {
    remove_all(conn);
    println!("fake it");
}
