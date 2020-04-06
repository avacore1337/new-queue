#![allow(proc_macro_derive_resolution_fallback)]
use crate::models::user::User;
use crate::schema::super_admins;
use serde::Serialize;

#[derive(Queryable, Serialize, Associations)]
#[belongs_to(parent = "User")]
pub struct SuperAdmin {
    pub id: i32,
    pub user_id: i32,
}
