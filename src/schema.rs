table! {
    use diesel::sql_types::*;
    use crate::sql_types::*;

    admins (id) {
        id -> Int4,
        user_id -> Int4,
        queue_id -> Int4,
        admin_type -> Admin_enum,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::sql_types::*;

    queue_entries (id) {
        id -> Int4,
        user_id -> Int4,
        queue_id -> Int4,
        location -> Varchar,
        usercomment -> Varchar,
        starttime -> Timestamptz,
        gettinghelp -> Bool,
        help -> Bool,
        badlocation -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::sql_types::*;

    queues (id) {
        id -> Int4,
        name -> Varchar,
        locked -> Bool,
        hiding -> Bool,
        motd -> Varchar,
        info -> Varchar,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::sql_types::*;

    super_admins (id) {
        id -> Int4,
        user_id -> Int4,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::sql_types::*;

    users (id) {
        id -> Int4,
        username -> Text,
        ugkthid -> Text,
        realname -> Text,
    }
}

joinable!(admins -> queues (queue_id));
joinable!(admins -> users (user_id));
joinable!(queue_entries -> queues (queue_id));
joinable!(queue_entries -> users (user_id));
joinable!(super_admins -> users (user_id));

allow_tables_to_appear_in_same_query!(
    admins,
    queue_entries,
    queues,
    super_admins,
    users,
);
