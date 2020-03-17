# new-queue

This the the new queue system, written in rust.

## Setup
```bash
sudo apt install libssl-dev
sudo apt install postgresql postgresql-contrib
sudo apt install libpq-dev openssl -y
```

### Setup postgresql

setup a user with password. Create a .env file that looks like this:
```bash
DATABASE_URL=postgres://username:password@localhost/diesel_demo
```

### Get rust nightly
Get [rustup](https://rustup.rs/) (nightly version) from

Install Diesel CLI
```bash
cargo install diesel_cli --no-default-features --features postgres
```

Setup the database
```bash
diesel setup
```

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

Reset all migrations with
```bash
for x in ./migrations/20*; do diesel migration revert; done; diesel migration run
```

# guides
* [Rocket, diesel, serde setup](https://lankydan.dev/2018/05/20/creating-a-rusty-rocket-fuelled-with-diesel)
* [Rust react setup](https://github.com/ghotiphud/rust-web-starter)
* [Chat blog](https://www.steadylearner.com/blog/read/How-to-start-Rust-Chat-App)
* [Steadylearner Chat](https://github.com/steadylearner/Chat)
