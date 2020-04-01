#![feature(proc_macro_hygiene, decl_macro)]

use std::thread;

#[macro_use]
extern crate rocket;

extern crate r2d2;
extern crate r2d2_diesel;

#[macro_use]
extern crate rocket_contrib;
use rocket_cors;

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate validator_derive;

use dotenv::dotenv;

mod auth;
mod config;
mod db;
mod errors;
mod models;
mod routes;
mod schema;
mod wsroutes;

use rocket_contrib::json::JsonValue;
use rocket_cors::Cors;

#[catch(404)]
fn not_found() -> JsonValue {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

fn cors_fairing() -> Cors {
    Cors::from_options(&Default::default()).expect("Cors fairing cannot be created")
}

pub fn rocket() -> rocket::Rocket {
    thread::Builder::new()
        .name("Thread for Rust Chat with ws-rs".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| {
            wsroutes::ws_rs::websocket();
        })
        .unwrap();
    dotenv().ok();
    rocket::custom(config::from_env())
        .manage(db::init_pool())
        .mount("/", routes![routes::static_files::file,])
        .mount(
            "/api",
            routes![
                routes::users::post_users,
                routes::users::post_users_login,
                // routes::users::put_user,
                routes::users::get_user,
                routes::queues::post_queues,
                routes::queues::get_queues,
                // routes::articles::post_articles,
                // routes::articles::put_articles,
                // routes::articles::get_article,
                // routes::articles::delete_article,
                // routes::articles::favorite_article,
                // routes::articles::unfavorite_article,
                // routes::articles::get_articles,
                // routes::articles::get_articles_feed,
                // routes::articles::post_comment,
                // routes::articles::get_comments,
                // routes::articles::delete_comment,
                // routes::tags::get_tags,
                // routes::profiles::get_profile,
                // routes::profiles::follow,
                // routes::profiles::unfollow,
            ],
        )
        .attach(cors_fairing())
        .attach(config::AppState::manage())
        .register(catchers![not_found])
}
