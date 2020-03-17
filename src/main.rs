#![feature(
    proc_macro_hygiene,
    decl_macro,
    rustc_private,
    type_ascription
)]
extern crate chrono;
#[macro_use]
extern crate rocket;
extern crate diesel;
extern crate dotenv;
extern crate ws;
extern crate rocket_contrib;
extern crate serde;

// use chrono::prelude::*;
// use diesel::prelude::*;
// use diesel::pg::PgConnection;
// use dotenv::dotenv;
// use std::env;

// use self::models::*;

use std::thread;

mod route;
use crate::route::{get, static_files};

mod chat;
use crate::chat::ws_rs;

fn rocket() -> rocket::Rocket {
    let rocket_routes = routes![
        static_files::file,
        //
        get::index,
        get::chat,
        get::queues,
    ];

    rocket::ignite()
        .mount("/", rocket_routes)
}

// https://rust-lang.github.io/async-book/getting_started/why_async.html
fn main() {
    // $rustapi and search thread
    thread::Builder::new()
        .name("Thread for Rust Chat with ws-rs".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| {
            ws_rs::websocket();
        })
        .unwrap();

    rocket().launch();
}

