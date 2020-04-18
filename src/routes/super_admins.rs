use crate::auth::{validate_auth, Auth, AuthLevel};
use crate::db::{self, super_admins};

use rocket_contrib::json::JsonValue;

#[get("/superadmins")]
pub fn get_superadmins(auth: Auth, conn: db::DbConn) -> Option<JsonValue> {
    let _auth = validate_auth(&conn, None, auth, AuthLevel::Super);
    Some(json!(super_admins::all(&conn)?))
}
