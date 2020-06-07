use crate::db;
use crate::db::queue_entries::remove_all;
use crate::errors::LdapError;
use crate::models::user::User;
use crate::reqwest;
use clokwerk::{Scheduler, TimeUnits};
use diesel::pg::PgConnection;
use ldap3::{LdapConn, ResultEntry, Scope, SearchEntry};
use regex::Regex;
use rocket::request::Form;
use std::thread;
use std::time::Duration;

const LDAP_USERNAME: &str = "uid";
const LDAP_REALNAME: &str = "cn";
const LDAP_UGKTHID: &str = "ugKthid";

pub fn start_scheduled_tasks() {
    thread::Builder::new()
        .name("chrono thread".into())
        .spawn(move || {
            // or a scheduler with a given timezone
            let mut scheduler = Scheduler::with_tz(chrono::Utc);
            scheduler.every(1.day()).at("03:00").run(move || {
                let conn = db::get_single_connection();
                println!("Running nightly cleanup task");
                cleanup(&conn);
            });
            loop {
                scheduler.run_pending();
                thread::sleep(Duration::from_millis(500));
            }
        })
        .unwrap();
}
pub fn cleanup(conn: &PgConnection) {
    if let Err(e) = remove_all(conn) {
        println!("Something went wrong! {}", e);
    }
}

pub struct LdapUser {
    pub username: String,
    pub ugkthid: String,
    pub realname: String,
}

#[derive(FromForm, Default)]
pub struct Ticket {
    ticket: Option<String>,
}

fn convert_to_ldap_user(mut rs: Vec<ResultEntry>) -> Option<LdapUser> {
    let mut entry = SearchEntry::construct(rs.pop()?);
    println!("Got entry:\n{:?}", entry);
    Some(LdapUser {
        username: entry.attrs.get_mut(LDAP_USERNAME)?.pop()?.to_string(),
        ugkthid: entry.attrs.get_mut(LDAP_UGKTHID)?.pop()?.to_string(),
        realname: entry.attrs.get_mut(LDAP_REALNAME)?.pop()?.to_string(),
    })
}

// ldapsearch -x -H ldaps://ldap.kth.se -b ou=Unix,dc=kth,dc=se uid=ransin ugKthid | grep "ugKthid"
fn fetch_ldap_data_by_ugkthid(ugkthid: &str) -> Result<LdapUser, Box<dyn std::error::Error>> {
    println!("fetching ldap data");
    let ldap = LdapConn::new("ldaps://ldap.kth.se")?;
    let (rs, _res) = ldap
        .search(
            "ou=Unix,dc=kth,dc=se",
            Scope::Subtree,
            &(LDAP_UGKTHID.to_string() + "=" + ugkthid),
            vec![LDAP_UGKTHID, LDAP_USERNAME, LDAP_REALNAME],
        )?
        .success()?;
    convert_to_ldap_user(rs).ok_or(Box::new(LdapError))
}

pub fn fetch_ldap_data_by_username(username: &str) -> Result<LdapUser, Box<dyn std::error::Error>> {
    let ldap = LdapConn::new("ldaps://ldap.kth.se")?;
    let (rs, _res) = ldap
        .search(
            "ou=Unix,dc=kth,dc=se",
            Scope::Subtree,
            &(LDAP_USERNAME.to_string() + "=" + username),
            vec![LDAP_UGKTHID, LDAP_USERNAME, LDAP_REALNAME],
        )?
        .success()?;
    convert_to_ldap_user(rs).ok_or(Box::new(LdapError))
}

// ticket example: ST-675984-sfGECP3JozSUYekz9Vg3-login01
fn validate_ticket(ticket: &str) -> Option<String> {
    println!("Validating ticket");
    let url = "https://login.kth.se/serviceValidate?ticket=".to_string()
        + ticket
        + "&service=http://queue.csc.kth.se/auth";
    let res = reqwest::blocking::get(&url).ok()?.text().ok()?;
    println!("body = {:?}", res);
    if res.contains("authenticationFailure") {
        None
    } else {
        let re = Regex::new(r"(u1[\d|\w]+)").unwrap();
        re.captures(&res).map(|cap| cap[0].to_string())
    }
}

pub fn handle_login(conn: &db::DbConn, params: Form<Ticket>) -> Option<User> {
    let ugkthid = validate_ticket(params.ticket.as_ref()?)?;
    match fetch_ldap_data_by_ugkthid(&ugkthid) {
        Ok(ldap_user) => db::users::upsert_ugkthid(
            conn,
            &ldap_user.username,
            &ldap_user.ugkthid,
            &ldap_user.realname,
        )
        .ok(),
        Err(_) => None,
    }
}
