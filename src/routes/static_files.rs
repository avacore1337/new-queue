use rocket::response::NamedFile;
use std::path::{Path, PathBuf};

#[get("/<file..>")]
pub fn file(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("public/build/").join(file)).ok()
}
