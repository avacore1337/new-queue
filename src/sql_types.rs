#[derive(Debug, PartialEq, DbEnum, Clone)]
#[DieselType = "Admin_enum"]
pub enum AdminEnum {
    Assistant,
    Teacher,
}
