use crate::auth::Auth;
use crate::db::{self, super_admins};

use rocket_contrib::json::JsonValue;

#[get("/superadmins")]
pub fn get_superadmins(_auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    Some(json!(super_admins::all(&conn)?))
}
