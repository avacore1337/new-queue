use crate::schema::banners;
use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Identifiable, Queryable, Serialize, Debug)]
pub struct Banner {
    pub id: i32,
    pub message: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}
