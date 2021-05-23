use crate::db;
use crate::db::queue_entries;
use crate::db::queues;
use crate::errors::LdapError;
use crate::models::queue_entry::QueueEntry;
use crate::models::user::User;
use crate::reqwest;
use crate::schema;
use clokwerk::{Scheduler, TimeUnits};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use dns_lookup::lookup_addr;
use ldap3::{LdapConn, ResultEntry, Scope, SearchEntry};
use regex::Regex;
use rocket::request::Form;
use rocket_client_addr::ClientAddr;
use std::thread;
use std::time::Duration;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

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

pub fn cleanup_wrapper(conn: &PgConnection) -> Result<()> {
    for queue in queues::all(conn) {
        let entries: Vec<QueueEntry> = QueueEntry::belonging_to(&queue).load(conn)?;
        for entry in entries {
            db::user_events::create(conn, &entry, true)?;
        }
    }
    queue_entries::remove_all(conn)?;
    queues::clear_all_motds(conn)?;
    Ok(())
}

pub fn cleanup(conn: &PgConnection) {
    if let Err(e) = cleanup_wrapper(conn) {
        println!("Something went wrong when doing nightly cleanup! {}", e);
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
    // println!("Got entry:\n{:?}", entry);
    Some(LdapUser {
        username: entry.attrs.get_mut(LDAP_USERNAME)?.pop()?.to_string(),
        ugkthid: entry.attrs.get_mut(LDAP_UGKTHID)?.pop()?.to_string(),
        realname: entry.attrs.get_mut(LDAP_REALNAME)?.pop()?.to_string(),
    })
}

// ldapsearch -x -H ldaps://ldap.kth.se -b ou=Unix,dc=kth,dc=se uid=ransin ugKthid | grep "ugKthid"
fn fetch_ldap_data_by_ugkthid(ugkthid: &str) -> Result<LdapUser> {
    // println!("fetching ldap data");
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

pub fn fetch_ldap_data_by_username(username: &str) -> Result<LdapUser> {
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
    // println!("Validating ticket");
    let url = "https://login.kth.se/serviceValidate?ticket=".to_string()
        + ticket
        + "&service=https://queue.csc.kth.se/auth";
    let res = reqwest::blocking::get(&url).ok()?.text().ok()?;
    // println!("body = {:?}", res);
    if res.contains("authenticationFailure") {
        println!("authenticationFailure for ticket {}", ticket);
        None
    } else {
        let re = Regex::new(r"(u1[\d|\w]+)").unwrap();
        re.captures(&res).map(|cap| cap[0].to_string())
    }
}

pub fn handle_login(conn: &PgConnection, params: Form<Ticket>) -> Option<User> {
    let ugkthid = validate_ticket(params.ticket.as_ref()?)?;
    match fetch_ldap_data_by_ugkthid(&ugkthid) {
        Ok(ldap_user) => match db::users::find_by_ugkthid(conn, &ugkthid) {
            Ok(user) => diesel::update(&user)
                .set((
                    schema::users::username.eq(&ldap_user.username),
                    schema::users::realname.eq(&ldap_user.realname),
                ))
                .get_result(&*conn)
                .ok(),
            Err(_) => db::users::create(
                conn,
                &ldap_user.username,
                &ldap_user.ugkthid,
                &ldap_user.realname,
            )
            .ok(),
        },
        Err(_) => None,
    }
}

// Test if they are at a recognized school computer
// Recognized computers are:
// E-house floor 4 : Blue, Red, Orange, Yellow, Green, Brown
// E-house floor 5 : Grey, Karmosin, White, Magenta, Violett, Turkos
// D-house floor 5 : Spel, Sport, Musik, Konst, Mat
// Kista : ka 650, ka d4
pub fn get_location(client_addr: &ClientAddr) -> Option<String> {
    let host = lookup_addr(&client_addr.ip).ok()?;
    println!("Hostname is {}", host);
    if !host.ends_with(".kth.se") {
        None
    } else {
        let kth_subname = host
            .split('.')
            .next()
            .unwrap()
            .replace("-", " ")
            .to_lowercase();
        let re = Regex::new(r"(blue|red|orange|yellow|green|brown|grey|karmosin|white|magenta|violett|turkos|spel|sport|musik|konst|mat|ka\s650|ka\sd4)").unwrap();
        let fixed_name = match re.captures(&kth_subname)?.get(0)?.as_str() {
            "ka 650" => kth_subname.replace("ka 650", "Ka-209"),
            "ka d4" => kth_subname.replace("ka d4", "Ka-309"),
            "mat" => kth_subname.replace("mat", "mat "),
            name => name.to_string(),
        };

        Some(fixed_name)
    }
}
