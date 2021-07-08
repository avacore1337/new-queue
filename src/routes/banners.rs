use crate::db;
use rocket_contrib::json::JsonValue;

#[get("/banners")]
pub fn get_banners(conn: db::DbConn) -> JsonValue {
    json!({ "queues": db::banners::all(&conn) })
}
