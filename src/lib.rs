#![feature(proc_macro_hygiene, decl_macro)]

use std::panic;
use std::thread;

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_contrib;

#[macro_use]
extern crate diesel;

extern crate reqwest;

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
mod util;
mod wsroutes;

use rocket::response::NamedFile;
use rocket::Request;
use rocket_contrib::serve::StaticFiles;
use rocket_cors::Cors;

use rocket::response::status::NotFound;

#[catch(404)]
fn not_found(req: &Request) -> Result<NamedFile, NotFound<String>> {
    println!(
        "I couldn't find '{}'. Try something else?",
        req.uri().path()
    );
    format!("I couldn't find '{}'. Try something else?", req.uri());
    // match req.uri().path().split('/').collect::<Vec<&str>>().as_slice() {
    if req.uri().path().starts_with("/api/") {
        Err(NotFound("Invalid api call".to_string()))
    } else {
        NamedFile::open("public/build/index.html")
            .map_err(|_| NotFound("index.html not found. Boy do we have a problem".to_string()))
    }
}

fn cors_fairing() -> Cors {
    Cors::from_options(&Default::default()).expect("Cors fairing cannot be created")
}

pub fn rocket() -> rocket::Rocket {
    dotenv().ok();
    util::start_scheduled_tasks();

    thread::Builder::new()
        .name("ws-rs thread".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| loop {
            let result = panic::catch_unwind(|| {
                wsroutes::ws_rs::websocket();
            });
            if result.is_err() {
                println!("We paniced in the socket thread. That's bad");
            } else {
                println!("Exited normally, which shouldn't happen either...");
            }
        })
        .unwrap();

    rocket::custom(config::from_env())
        .mount("/", StaticFiles::from("public/build"))
        .mount(
            "/",
            routes![routes::login::kth_oidc_auth, routes::login::kth_login,],
        )
        .mount(
            "/api",
            routes![
                routes::users::post_users_login,
                routes::users::get_user,
                routes::banners::get_banners,
                routes::queues::get_queues,
                routes::queues::get_queues_filtered,
                routes::queues::get_queue,
                routes::queue_entries::get_queue_entries,
                routes::queue_entries::get_all_queue_entries,
                routes::user_events::get_user_events,
                routes::admins::get_assistants,
                routes::admins::get_teachers,
                routes::super_admins::get_superadmins,
            ],
        )
        .attach(db::DbConn::fairing())
        .attach(cors_fairing())
        .attach(config::AppState::manage())
        .register(catchers![not_found])
}
