#![allow(proc_macro_derive_resolution_fallback)]
use serde::Serialize;

use chrono::{DateTime, Utc};

#[derive(Queryable, Serialize, Associations)]
pub struct QueueEntry {
        pub id: i32,
        pub user_id: i32,
        pub queue_id: i32,
        pub comment : String,
        pub location : String,
        pub starttime: DateTime<Utc>,
        pub gettinghelp : bool,
        pub helper : String,
        pub help : bool,
        pub badlocation : bool,
  }
