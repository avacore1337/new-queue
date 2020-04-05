#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::queue::Queue;
use crate::models::user::User;
use crate::schema::admins;
use crate::sql_types::AdminEnum;
use serde::Serialize;

#[derive(Queryable, Serialize, Associations)]
#[belongs_to(parent = "User")]
#[belongs_to(parent = "Queue")]
pub struct Admin {
    pub id: i32,
    pub user_id: i32,
    pub queue_id: i32,
    pub admin_type: AdminEnum,
}
