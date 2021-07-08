// use crate::db;
use crate::models::banner::Banner;
use crate::schema::banners;
use chrono::{DateTime, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn all(conn: &PgConnection) -> Option<Vec<Banner>> {
    let now = Utc::now();
    banners::table
        .filter(banners::end_time.gt(now))
        .select((
            banners::id,
            banners::message,
            banners::start_time,
            banners::end_time,
        ))
        .load::<Banner>(conn)
        .ok()
}

pub fn update(
    conn: &PgConnection,
    banner_id: i32,
    message: String,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
) -> Result<Banner, diesel::result::Error> {
    let banner = find_banner(conn, banner_id)?;
    diesel::update(&banner)
        .set((
            banners::message.eq(message),
            banners::start_time.eq(start_time),
            banners::end_time.eq(end_time),
        ))
        .get_result(conn)
}

pub fn find_banner(conn: &PgConnection, banner_id: i32) -> Result<Banner, diesel::result::Error> {
    banners::table
        .filter(banners::id.eq(banner_id))
        .get_result::<Banner>(&*conn)
        .map_err(Into::into)
}

pub fn create(
    conn: &PgConnection,
    message: String,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
) -> Result<Banner, diesel::result::Error> {
    let new_banner = &NewBanner {
        message: &message,
        start_time,
        end_time,
    };

    diesel::insert_into(banners::table)
        .values(new_banner)
        .get_result::<Banner>(conn)
        .map_err(Into::into)
}

#[derive(Insertable)]
#[table_name = "banners"]
pub struct NewBanner<'a> {
    message: &'a str,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
}
