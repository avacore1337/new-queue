# new-queue

This the the new queue system, written in rust.

## Setup
'''bash
sudo apt install libssl-dev
sudo apt install postgresql postgresql-contrib
sudo apt install libpq-dev openssl -y
'''

Get rustup (nightly version) from https://rustup.rs/

install postgresql

setup a user with password
- Add the password to the .env file in the root directory of the repository

Build the project
´´´bash
cargo build
´´´

Install Diesel CLI
´´´bash
cargo install diesel_cli --no-default-features --features postgres
´´´

Fix the database
´´´bash
diesel setup
´´´

Start the project using
´´´bash
cargo run
´´´

# guides

[Rocket, diesel, serde setup]: https://lankydan.dev/2018/05/20/creating-a-rusty-rocket-fuelled-with-diesel
[Rust react setup]: https://github.com/ghotiphud/rust-web-starter
[Chat blog]: ttps://www.steadylearner.com/blog/read/How-to-start-Rust-Chat-App
[Steadylearner Chat]: https://github.com/steadylearner/Chat
