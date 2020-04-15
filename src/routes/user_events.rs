use crate::db::{self};
use chrono::Utc;
use rocket::request::Form;

use rocket_contrib::json::JsonValue;

// #[get("/articles/feed?<params..>")]
// pub fn get_articles_feed(params: Form<FeedArticles>, auth: Auth, conn: db::Conn) -> JsonValue {
//     let articles = db::articles::feed(&conn, &params, auth.id);

#[get("/queues/<queue_name>/user_events?<params..>")]
pub fn get_user_events(
    queue_name: String,
    params: Form<db::user_events::Interval>,
    conn: db::DbConn,
) -> Option<JsonValue> {
    Some(json!(db::user_events::for_queue(
        &conn,
        &queue_name,
        Utc::now(),
        Utc::now()
    )?))
}
