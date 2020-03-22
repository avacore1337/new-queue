use std::path::{Path, PathBuf};
use rocket::response::NamedFile;

#[get("/public/public/<file..>")]
pub fn file(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

