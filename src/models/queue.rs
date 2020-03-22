use serde::Serialize;

#[derive(Queryable, Serialize)]
pub struct Queue {
        pub id: i32,
        pub name: String,
        pub locked : bool,
        pub hiding : bool,
        pub motd: String,
        pub info : String,
  }
