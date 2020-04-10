#![feature(proc_macro_hygiene, decl_macro)]

use std::thread;

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_contrib;
use rocket_cors;

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_derive_enum;

#[macro_use]
extern crate validator_derive;

use dotenv::dotenv;

mod auth;
mod config;
mod db;
mod errors;
mod models;
mod routes;
#[allow(unused_imports)]
mod schema;
mod sql_types;
mod wsroutes;

use rocket_contrib::json::JsonValue;
use rocket_contrib::serve::StaticFiles;
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
    dotenv().ok();
    thread::Builder::new()
        .name("Thread for Rust Chat with ws-rs".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| {
            wsroutes::ws_rs::websocket();
        })
        .unwrap();
    rocket::custom(config::from_env())
        .manage(db::init_pool())
        .mount("/public", StaticFiles::from("/public/public"))
        .mount(
            "/api",
            routes![
                routes::users::post_users,
                routes::users::post_users_login,
                routes::users::get_user,
                routes::queues::post_queues,
                routes::queues::get_queues,
                routes::queues::get_queue,
                routes::queue_entries::get_queue_entries,
                routes::admins::get_assistants,
                routes::admins::get_teachers,
                routes::super_admins::get_superadmins,
            ],
        )
        .attach(cors_fairing())
        .attach(config::AppState::manage())
        .register(catchers![not_found])
}
