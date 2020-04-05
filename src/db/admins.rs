use crate::db;
use crate::models::admin::Admin;
use crate::schema::admins;
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

#[derive(Insertable)]
#[table_name = "admins"]
pub struct NewAdmin {
    user_id: i32,
    queue_id: i32,
    admin_type: AdminEnum,
}
