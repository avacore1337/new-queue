use rocket_contrib::databases::diesel;

pub mod admins;
pub mod queue_entries;
pub mod queues;
pub mod super_admins;
pub mod user_events;
pub mod users;

use diesel::pg::PgConnection;
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::{Outcome, Request, State};
use std::env;
use std::ops::Deref;

// use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};

pub type PgPool = Pool<ConnectionManager<PgConnection>>;

// fn init_pool() -> Result<PgPool, PoolError> {
pub fn init_pool() -> PgPool {
    let manager = ConnectionManager::<PgConnection>::new(database_url());
    Pool::builder().build(manager).expect("db pool")
}

fn database_url() -> String {
    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}

pub struct DbConn(pub PooledConnection<ConnectionManager<PgConnection>>);

impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();

    fn from_request(request: &'a Request<'r>) -> request::Outcome<DbConn, Self::Error> {
        let pool = request.guard::<State<PgPool>>()?;
        match pool.get() {
            Ok(conn) => Outcome::Success(DbConn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for DbConn {
    type Target = PgConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
