use crate::auth::Auth;
use crate::db;
use crate::models::admin::Admin;
use crate::models::user::User;
use crate::schema::*;
use crate::sql_types::AdminEnum;
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn create(
    conn: &PgConnection,
    queue_name: &str,
    username: &str,
    admin_type: AdminEnum,
) -> Result<Admin, diesel::result::Error> {
    let queue_id = db::queues::name_to_id(conn, queue_name)?;
    let user_id = db::users::username_to_id(conn, username)?;
    let new_admin = &NewAdmin {
        user_id,
        queue_id,
        admin_type,
    };

    diesel::insert_into(admins::table)
        .values(new_admin)
        .get_result::<Admin>(conn)
        .map_err(Into::into)
}

pub fn remove(
    conn: &PgConnection,

    queue_name: &str,
    username: &str,
) -> Result<(), diesel::result::Error> {
    let user_id = db::users::username_to_id(conn, username)?;
    let queue_id = db::queues::name_to_id(conn, queue_name)?;
    diesel::delete(
        admins::table.filter(
            admins::user_id
                .eq(user_id)
                .and(admins::queue_id.eq(queue_id)),
        ),
    )
    .execute(conn)
    .map_err(Into::into)
    .map(|_| ())
}

#[derive(Insertable)]
#[table_name = "admins"]
pub struct NewAdmin {
    user_id: i32,
    queue_id: i32,
    admin_type: AdminEnum,
}

pub fn admin_for_queue(conn: &PgConnection, queue_name: &str, auth: &Auth) -> Option<AdminEnum> {
    admins::table
        .inner_join(queues::table)
        .filter(queues::name.eq(queue_name).and(admins::user_id.eq(auth.id)))
        .select(admins::admin_type)
        .first(conn)
        .ok()
}

pub fn teachers_for_queue(conn: &PgConnection, name: &str) -> Option<Vec<User>> {
    admins::table
        .inner_join(queues::table)
        .inner_join(users::table)
        .filter(
            queues::name
                .eq(name)
                .and(admins::admin_type.eq(AdminEnum::Teacher)),
        )
        .select((users::id, users::username, users::ugkthid, users::realname))
        .load::<User>(conn)
        .ok()
}

pub fn assistants_for_queue(conn: &PgConnection, name: &str) -> Option<Vec<User>> {
    admins::table
        .inner_join(queues::table)
        .inner_join(users::table)
        .filter(
            queues::name
                .eq(name)
                .and(admins::admin_type.eq(AdminEnum::Assistant)),
        )
        .select((users::id, users::username, users::ugkthid, users::realname))
        .load::<User>(conn)
        .ok()
}
