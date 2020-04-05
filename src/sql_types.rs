use serde::Serialize;

#[derive(Debug, PartialEq, DbEnum, Clone, Serialize)]
#[DieselType = "Admin_enum"]
pub enum AdminEnum {
    Assistant,
    Teacher,
}
