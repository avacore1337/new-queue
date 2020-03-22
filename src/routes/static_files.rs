use std::path::{Path, PathBuf};
use rocket::response::NamedFile;

#[get("/<file..>")]
pub fn file(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("public/build/").join(file)).ok()
}

