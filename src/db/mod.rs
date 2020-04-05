use rocket_contrib::databases::diesel;

pub mod admin;
pub mod queue_entries;
pub mod queues;
pub mod users;

// #[database("diesel_postgres_pool")]
// pub struct Conn(diesel::PgConnection);

use diesel::pg::PgConnection;
use r2d2;
use r2d2_diesel::ConnectionManager;
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::{Outcome, Request, State};
use std::env;
use std::ops::Deref;

pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;

pub fn init_pool() -> Pool {
    let manager = ConnectionManager::<PgConnection>::new(database_url());
    Pool::new(manager).expect("db pool")
}

fn database_url() -> String {
    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}

pub struct DbConn(pub r2d2::PooledConnection<ConnectionManager<PgConnection>>);

impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();

    fn from_request(request: &'a Request<'r>) -> request::Outcome<DbConn, Self::Error> {
        let pool = request.guard::<State<Pool>>()?;
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

// use diesel::prelude::*;
// use diesel::query_dsl::methods::LoadQuery;
// use diesel::query_builder::*;
// use diesel::pg::Pg;
// use diesel::sql_types::BigInt;

// pub trait OffsetLimit: Sized {
//     fn offset_and_limit(self, offset: i64, limit: i64) -> OffsetLimited<Self>;
// }

// impl<T> OffsetLimit for T {
//     fn offset_and_limit(self, offset: i64, limit: i64) -> OffsetLimited<Self> {
//         OffsetLimited {
//             query: self,
//             limit,
//             offset,
//         }
//     }
// }

// #[derive(Debug, Clone, Copy, QueryId)]
// pub struct OffsetLimited<T> {
//     query: T,
//     offset: i64,
//     limit: i64,
// }

// impl<T> OffsetLimited<T> {

//     pub fn load_and_count<U>(self, conn: &PgConnection) -> QueryResult<(Vec<U>, i64)>
//     where
//         Self: LoadQuery<PgConnection, (U, i64)>,
//     {
//         let results = self.load::<(U, i64)>(conn)?;
//         let total = results.get(0).map(|x| x.1).unwrap_or(0);
//         let records = results.into_iter().map(|x| x.0).collect();
//         Ok((records, total))
//     }
// }

// impl<T: Query> Query for OffsetLimited<T> {
//     type SqlType = (T::SqlType, BigInt);
// }

// impl<T> RunQueryDsl<PgConnection> for OffsetLimited<T> {}

// impl<T> QueryFragment<Pg> for OffsetLimited<T>
// where
//     T: QueryFragment<Pg>,
// {
//     fn walk_ast(&self, mut out: AstPass<Pg>) -> QueryResult<()> {
//         out.push_sql("SELECT *, COUNT(*) OVER () FROM (");
//         self.query.walk_ast(out.reborrow())?;
//         out.push_sql(") t LIMIT ");
//         out.push_bind_param::<BigInt, _>(&self.limit)?;
//         out.push_sql(" OFFSET ");
//         out.push_bind_param::<BigInt, _>(&self.offset)?;
//         Ok(())
//     }
// }
