table! {
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
    users (id) {
        id -> Int4,
        username -> Text,
        ugkthid -> Text,
        realname -> Text,
    }
}

allow_tables_to_appear_in_same_query!(
    queues,
    users,
);
