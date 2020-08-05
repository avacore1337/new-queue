// use rocket::config::{Config, Environment, LoggingLevel, Value};
use rocket::config::{Config, Environment, Value};
use rocket::fairing::AdHoc;
use std::collections::HashMap;
use std::env;

/// Debug only secret for JWT encoding & decoding.
const SECRET: &'static str = "8Xui8SN4mI+7egV/9dlfYYLGQJeEx4+DwmSQLwDVXJg=";

/// js toISOString() in test suit can't handle chrono's default precision
// pub const DATE_FORMAT: &'static str = "%Y-%m-%dT%H:%M:%S%.3fZ";

pub const TOKEN_PREFIX: &'static str = "Token ";

pub struct AppState {
    pub secret: Vec<u8>,
}

pub fn get_secret() -> String {
    env::var("SECRET_KEY").unwrap_or_else(|err| {
        if cfg!(debug_assertions) {
            SECRET.to_string()
        } else {
            panic!("No SECRET_KEY environment variable found: {:?}", err)
        }
    })
}

impl AppState {
    pub fn manage() -> AdHoc {
        AdHoc::on_attach("Manage config", |rocket| {
            // Rocket doesn't expose it's own secret_key, so we use our own here.
            let secret = get_secret();
            Ok(rocket.manage(AppState {
                secret: secret.into_bytes(),
            }))
        })
    }
}

/// Create rocket config from environment variables
pub fn from_env() -> Config {
    let environment = Environment::active().expect("No environment found");

    let port = env::var("ROCKET_PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()
        .expect("PORT environment variable should parse to an integer");

    let address = env::var("ROCKET_ADDRESS").unwrap_or_else(|_| "127.0.0.1".to_string());

    let mut database_config = HashMap::new();
    let mut databases = HashMap::new();
    let database_url =
        env::var("DATABASE_URL").expect("No DATABASE_URL environment variable found");
    database_config.insert("url", Value::from(database_url));
    databases.insert("diesel_postgres_pool", Value::from(database_config));

    Config::build(environment)
        .environment(environment)
        .port(port)
        .address(address)
        // .log_level(LoggingLevel::Debug)
        .workers(4)
        .extra("databases", databases)
        .finalize()
        .unwrap()
}
