use crate::auth::Auth;
use crate::db::super_admins;
use crate::models::queue::Queue;
use crate::schema::{admins, queues, users};
use crate::sql_types::AdminEnum;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};
use unicode_truncate::UnicodeTruncateStr;

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

pub fn update_motd(
    conn: &PgConnection,
    queue_name: &str,
    message: &str,
) -> Result<Queue, diesel::result::Error> {
    diesel::update(queues::table.filter(queues::name.eq(queue_name)))
        .set(queues::motd.eq(message))
        .get_result(conn)
}

pub fn update_hiding(
    conn: &PgConnection,
    queue_name: &str,
    status: bool,
) -> Result<Queue, diesel::result::Error> {
    diesel::update(queues::table.filter(queues::name.eq(queue_name)))
        .set(queues::hiding.eq(status))
        .get_result(conn)
}

pub fn update_locked(
    conn: &PgConnection,
    queue_name: &str,
    status: bool,
) -> Result<Queue, diesel::result::Error> {
    diesel::update(queues::table.filter(queues::name.eq(queue_name)))
        .set(queues::locked.eq(status))
        .get_result(conn)
}

pub fn update_info(
    conn: &PgConnection,
    queue_name: &str,
    message: &str,
) -> Result<Queue, diesel::result::Error> {
    diesel::update(queues::table.filter(queues::name.eq(queue_name)))
        .set(queues::info.eq(message))
        .get_result(conn)
}

pub fn name_to_id(conn: &PgConnection, name: &str) -> Result<i32, diesel::result::Error> {
    queues::table
        .filter(queues::name.eq(name))
        .select(queues::id)
        .first(&*conn)
        .map_err(Into::into)
}

pub fn teacher_filtered(conn: &PgConnection, auth: Auth) -> Vec<Queue> {
    match super_admins::is_super(conn, auth.id) {
        Some(_) => all(conn),
        None => admins::table
            .inner_join(queues::table)
            .inner_join(users::table)
            .filter(
                users::ugkthid
                    .eq(auth.ugkthid)
                    .and(admins::admin_type.eq(AdminEnum::Teacher)),
            )
            .select((
                queues::id,
                queues::name,
                queues::locked,
                queues::hiding,
                queues::motd,
                queues::info,
            ))
            .get_results::<Queue>(&*conn)
            .expect("Could not get queues"),
    }
}

pub fn find_by_name(conn: &PgConnection, name: &str) -> Result<Queue, diesel::result::Error> {
    queues::table
        .filter(queues::name.eq(name))
        .get_result::<Queue>(&*conn)
        .map_err(Into::into)
}

pub fn all(conn: &PgConnection) -> Vec<Queue> {
    queues::table
        .load::<Queue>(&*conn)
        .expect("Could not get queues")
}

pub fn remove(conn: &PgConnection, queue_name: &str) -> Result<(), diesel::result::Error> {
    let queue = find_by_name(conn, queue_name)?;
    diesel::delete(&queue)
        .execute(conn)
        .map_err(Into::into)
        .map(|_| ())
}

pub fn create(conn: &PgConnection, name: &str) -> Result<Queue, QueueCreationError> {
    let (name, _) = name.unicode_truncate(50);
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
