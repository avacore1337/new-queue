use diesel::Connection;
use rocket_contrib::databases::diesel;

pub mod admins;
pub mod banners;
pub mod queue_entries;
pub mod queues;
pub mod super_admins;
pub mod user_events;
pub mod users;

#[database("diesel_postgres_pool")]
pub struct DbConn(diesel::PgConnection);

use diesel::pg::PgConnection;
use std::env;

// use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use diesel::r2d2::{ConnectionManager, Pool};

pub type PgPool = Pool<ConnectionManager<PgConnection>>;

pub fn get_single_connection() -> PgConnection {
    PgConnection::establish(&database_url())
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url()))
}

// fn init_pool() -> Result<PgPool, PoolError> {
pub fn init_pool() -> PgPool {
    let manager = ConnectionManager::<PgConnection>::new(database_url());
    Pool::builder().build(manager).expect("db pool")
}

fn database_url() -> String {
    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}
