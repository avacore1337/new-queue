# new-queue

This the the new queue system for KTH (semi-official), rewritten in Rust and React.
The old one can be found [here](https://github.com/avacore1337/queueSystem) but is no longer in service.

The system is current running at <https://queue.csc.kth.se> and help students and teachers keep track of who's next to present and/or get help. For help/support please direct your questions to <robertwb@kth.se>.

## Setup
```bash
sudo apt install libssl-dev pkg-config -y
sudo apt install postgresql postgresql-contrib -y
sudo apt install libpq-dev openssl -y
cp .env.example .env
```

### Get rust nightly
Get [rustup](https://rustup.rs/) (nightly version)

run script, but pick nightly instead of stable. Subject to change when next time rocket [is upgraded](https://github.com/SergioBenitez/Rocket/milestone/8)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
````

rust version is managed by rust-toolchain.toml and should be automatically handled by ```cargo build```


Install Diesel CLI
```bash
cargo install diesel_cli --no-default-features --features postgres
```

### Setup postgresql
In case postgresql doesn't automaticaly start, run:
```bash
sudo service postgresql start
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

Since things need to be reliable you probably want to enable auto-restart, start on boot, static serve, firewall, https certificates, etc.
All the settings to set this up on a standard ubuntu 18.04, using Systemd and Nginx is available under the devops folder.
The current setting assume that you use let's encrypt.
Example instructions for how to set up can be found [here](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04).


## Working Localy

### Building
Build the project
```bash
cargo build
```

### Starting the webserver
Start the project using
```bash
cargo run
```

In this mode anyone can log in as anyone by going to /mocklogin

### Tips and tricks
Run new migrations with
```bash
diesel migration run
```

revert migrations with
```bash
diesel migration revert
```

Use sqlformat:
```
pip install sqlparse
sqlformat --reindent queue_history.sql -o queue_history.sql
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

Backend wants:
* routing framework
* backend websockets leave/errors
* can we please rename "help" to something else? Or make it an enum perhaps

Frontend wants
* [Feature] Anything else?
