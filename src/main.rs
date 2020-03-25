use queuesystem;
use std::thread;

mod wsroutes;
use crate::wsroutes::ws_rs;

fn main() {
    thread::Builder::new()
        .name("Thread for Rust Chat with ws-rs".into())
        // .stack_size(83886 * 1024) // 80mib in killobytes
        .spawn(|| {
            ws_rs::websocket();
        })
        .unwrap();
    queuesystem::rocket().launch();
}
