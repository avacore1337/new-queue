mod routes;
pub mod ws_rs;
use std::error;
use std::fmt;

enum AuthLevel {
    Any,
    Assistant,
    Teacher,
    SuperOrTeacher,
    Super,
}

#[derive(Debug, Clone)]
struct BadAuth;

impl fmt::Display for BadAuth {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "User is not logged in but attempted to do action that requires login data"
        )
    }
}

impl error::Error for BadAuth {
    fn description(&self) -> &str {
        "User is not logged in"
    }

    fn cause(&self) -> Option<&(dyn error::Error)> {
        // Generic error, underlying cause isn't tracked.
        None
    }
}
