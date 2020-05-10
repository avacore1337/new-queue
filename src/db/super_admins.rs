use crate::db;
use crate::models::super_admin::SuperAdmin;
use crate::models::user::User;
use crate::schema::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn create(conn: &PgConnection, user: User) -> Result<SuperAdmin, diesel::result::Error> {
    let new_admin = &NewSuperAdmin { user_id: user.id };

    diesel::insert_into(super_admins::table)
        .values(new_admin)
        .get_result::<SuperAdmin>(conn)
        .map_err(Into::into)
}

pub fn remove(conn: &PgConnection, username: &str) -> Result<(), diesel::result::Error> {
    let user_id = db::users::username_to_id(conn, username)?;
    diesel::delete(super_admins::table.filter(super_admins::user_id.eq(user_id)))
        .execute(conn)
        .map_err(Into::into)
        .map(|_| ())
}

#[derive(Insertable)]
#[table_name = "super_admins"]
pub struct NewSuperAdmin {
    user_id: i32,
}

pub fn is_super(conn: &PgConnection, user_id: i32) -> Option<SuperAdmin> {
    super_admins::table
        .filter(super_admins::user_id.eq(user_id))
        .first(conn)
        .ok()
}

pub fn all(conn: &PgConnection) -> Option<Vec<User>> {
    super_admins::table
        .inner_join(users::table)
        .select((users::id, users::username, users::ugkthid, users::realname))
        .load::<User>(conn)
        .ok()
}
