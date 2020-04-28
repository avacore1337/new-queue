# new-queue

This the the new queue system, written in rust.

## Setup
```bash
sudo apt install libssl-dev -y
sudo apt install postgresql postgresql-contrib -y
sudo apt install libpq-dev openssl -y
```

### Get rust nightly
Get [rustup](https://rustup.rs/) (nightly version) from

run script, but pick nightly instead of stable. Can be changed for the project with rustup if you forget.
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
````

Install Diesel CLI
```bash
cargo install diesel_cli --no-default-features --features postgres
```

### Setup postgresql

setup a user (with your current username) with password. You know it works when you can run `psql` Then run:
```bash
./reset_database.sh
```
If you want to reset your database you can just run the script again.

All the script really does is to run:
* psql -f init.sql
* diesel migration run
* psql -f testing.sql

### Setting up production
When setting up for production you need to create a database with password, and then add the new settings to the .env file.

The .env file also need a new secret so that auth tokens can't be decrypted.

Then simply run ```diesel migration run``` and you should be good to go.

## Building
Build the project
```bash
cargo build
```

## Starting the webserver
Start the project using
```bash
cargo run
```

## Tips and tricks
Run new migrations with
```bash
diesel migration run
```

revert migrations with
```bash
diesel migration revert
```

Install debuggin extensions for React and Redux
(Chrome)
- [React](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

(Firefox)
- [React](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- [Redux](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## guides
* [Rocket, diesel, serde setup](https://lankydan.dev/2018/05/20/creating-a-rusty-rocket-fuelled-with-diesel)
* [Rust react setup](https://github.com/ghotiphud/rust-web-starter)
* [Chat blog](https://www.steadylearner.com/blog/read/How-to-start-Rust-Chat-App)
* [Steadylearner Chat](https://github.com/steadylearner/Chat)
* [Realworld Rust Rocket](https://github.com/TatriX/realworld-rust-rocket)

# Features and Bugs

Backend:
* statistics, done?
* backend websockets leave/errors
* leaving needs to leave for messaging
* message history
* Lobby, broadcasts should also go to lobby and new route with all data should be added.

Frontend:
* Fix Help page
* Fix About page
* Fix Statistics page
* Add assistant operations to queue-page
* Add modal support
* Rewrite some parts of Redux to pure React
* Add delete & hide queue
* Allow assistants to send custom messages
