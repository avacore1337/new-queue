#![feature(proc_macro_hygiene, decl_macro)]

use std::thread;

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_contrib;
use rocket_cors;

#[macro_use]
extern crate diesel;

extern crate reqwest;

use dotenv::dotenv;

use clokwerk::{Scheduler, TimeUnits};
use std::time::Duration;

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

    thread::Builder::new()
        .name("chrono thread".into())
        .spawn(move || {
            // or a scheduler with a given timezone
            let pool = db::init_pool();

            let mut scheduler = Scheduler::with_tz(chrono::Utc);
            scheduler.every(1.day()).at("03:00").run(move || {
                println!("Running nightly cleanup task");
                let conn = pool.get().unwrap();
                util::cleanup(&db::DbConn(conn));
            });
            loop {
                scheduler.run_pending();
                thread::sleep(Duration::from_millis(500));
            }
        })
        .unwrap();

    thread::Builder::new()
        .name("ws-rs thread".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| {
            wsroutes::ws_rs::websocket();
        })
        .unwrap();

    rocket::custom(config::from_env())
        .mount("/", StaticFiles::from("public/build"))
        .mount(
            "/api",
            routes![
                routes::users::post_users_login,
                routes::users::kth_auth,
                routes::users::kth_login,
                routes::queues::get_queues,
                routes::queues::get_queue,
                routes::queue_entries::get_queue_entries,
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
