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

pub fn convert_to_ldap_user(mut rs: Vec<ResultEntry>) -> Option<LdapUser> {
    let mut entry = SearchEntry::construct(rs.pop()?);
    Some(LdapUser {
        username: entry.attrs.get_mut("uid")?.pop()?.to_string(),
        ugkthid: entry.attrs.get_mut("ugkthid")?.pop()?.to_string(),
        realname: entry.attrs.get_mut("cn")?.pop()?.to_string(),
    })
}

// ldapsearch -x -H ldaps://ldap.kth.se -b ou=Unix,dc=kth,dc=se uid=ransin ugKthid | grep "ugKthid"
pub fn fetch_ldap_data(ugkthid: &str) -> Result<LdapUser, Box<dyn std::error::Error>> {
    let ldap = LdapConn::new("ldaps://ldap.kth.se")?;
    let (rs, _res) = ldap
        .search(
            "ou=Unix,dc=kth,dc=se",
            Scope::Subtree,
            &("ugKthid=".to_string() + ugkthid),
            vec!["ugkthid", "uid", "cn"],
        )?
        .success()?;
    // for entry in rs {
    //     println!("{:?}", SearchEntry::construct(entry));
    // }
    convert_to_ldap_user(rs).ok_or(Box::new(LdapError))
}

// ticket example: ST-675984-sfGECP3JozSUYekz9Vg3-login01
fn validate_ticket(ticket: &str) -> Option<String> {
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
    match db::users::find_by_ugkthid(conn, &ugkthid) {
        Ok(user) => Some(user),
        Err(_) => match fetch_ldap_data(&ugkthid) {
            Ok(ldap_user) => db::users::create(
                conn,
                &ldap_user.username,
                &ldap_user.ugkthid,
                &ldap_user.realname,
            )
            .ok(),
            Err(e) => {
                println!("Encountered error {}", e);
                None
            }
        },
    }
}

// function getUsername (ugKthid, callback) {
//   var opts = {
//     filter: '(ugKthid=' + ugKthid + ')',
//     scope: 'sub'
//   };
//   var client = ldap.createClient({
//     url: 'ldaps://ldap.kth.se:636'
//   });
//   client.search('ou=Unix,dc=kth,dc=se', opts, function(err, res) {
//     res.on('searchEntry', function(entry) {
//       // console.log('entry: ' + JSON.stringify(entry.object));
//       // console.log('entry: ' + entry.object.cn);
//       // console.log('uid: ' + entry.object.uid);
//       callback(entry.object.cn, entry.object.uid);
//     });
//     res.on('searchReference', function(referral) {
//       console.log('referral: ' + referral.uris.join());
//     });
//     res.on('error', function(err) {
//       console.error('error: ' + err.message);
//     });
//     res.on('end', function(result) {
//       console.log('status: ' + result.status);
//     });
//   });
// }

// app.get('/auth', function(req, res) {
//   // console.log('printing ticket data:');
//   // console.log(req.query.ticket);
//   if(req.session.user){
//     req.session.user.location = "";
//   }
//   else{
//     req.session.user = {};
//     req.session.user.location = "";
//     req.session.user.loginTarget = "";
//   }

//   var ip = req.connection.remoteAddress;
//   // console.log("ip: " + ip);
//   getUID(req.query.ticket, function (uid) {
//       if(uid === ""){
//           res.redirect('/#' + req.session.user.loginTarget);
//           return;
//       }

//     getUsername(uid, function(cn, username) {
//       req.session.user.realname = cn;
//       req.session.user.username = username;
//       // console.log("worked");

//       // TODO implement username lookup fallback
//       // catch(err){
//       //   console.log(err);
//       //   req.session.user.realname = uid;
//       //   req.session.user.username = uid;
//       //   console.log("failed");
//       // }
//       // console.log(req.session.user);
//       // console.log("uid:" + uid);
//       req.session.user.ugKthid = uid;
//       getLocation(ip, function (location) {
//         req.session.user.location = location;
//         // console.log("Is this happening before ?");
//         res.redirect('/#' + req.session.user.loginTarget);
//       });

//     });
//   });
// });
