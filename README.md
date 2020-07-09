# new-queue

This the the new queue system, written in Rust and React.

## Setup
```bash
sudo apt install libssl-dev -y
sudo apt install postgresql postgresql-contrib -y
sudo apt install libpq-dev openssl -y
cp .env.example .env
```

### Get rust nightly
Get [rustup](https://rustup.rs/) (nightly version)

run script, but pick nightly instead of stable. Can be changed for the project with rustup if you forget.
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
````

If it doesn't compile you might need to install our currently used nightly version:
```bash
rustup toolchain install nightly-2020-03-07
```


Install Diesel CLI
```bash
cargo install diesel_cli --no-default-features --features postgres
```

### Setup postgresql
In case postgresql doesn't automaticaly start, run:
```bash
sudo service postgreqsl start
```

[setup a user with your current username](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04).

You know it works when you can run `psql` when logged in as your normal user.

Then run:
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

Then simply run ```diesel migration run``` and then start the server in production mode with:
```bash
cargo run --release
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

In this mode anyone can log in as anyone by going to /mocklogin

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

Issues on mobile devices:
* Navbar opens upon clicking it, which is unwanted if it's the "brand-text"
* Images and text does not adapt to mobile devices

Backend needs:
* Fix validate ticket regex index (switch to get)
* Handle sender of personal messages

Styling:
* Location/Comment/Help section on /Queue/:queueName
* Assistant/Teacher options drop-down on /Queue/:queueName
* Can we improve layout on /Statistics ?
* Can we improve search bar looks? Maybe make them smaller or add a magnifying glass or something ?
* Do not collapse nav-bar upon clicking it if it is not expanded (visual bug)
* Make /Help page more beautiful in general (images are updated once all styling is done)
* Do more if you like ^.^

Frontend needs:
* [Feature] Fix About page (half done, remove or replace "bla bla bla...")
* [Feature] Fix Help page (requires styling to be done)
* [Feature] Ability to clear the queue info
* [Feature] Better useability for clearing the MOTD

Backend wants:
* routing framework
* backend websockets leave/errors
* message history
* always update user data on login
* can we please rename "help" to something else? Or make it an enum perhaps

Frontend wants
* [Refactoring] Extract more view-components to make the HTML easier to read
* Protect against double click on "recieving help" since the "leave queue button" takes its place
* Sort queues in lobby after:
  1. Hidden (visible above)
  2. Own place in queue (lowest number first)
  3. Length of queue (highest value first)
  4. Alphabetically (a-z)
