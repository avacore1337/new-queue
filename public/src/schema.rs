table! {
    queue_entries (id) {
        id -> Int4,
        user_id -> Int4,
        queue_id -> Int4,
        location -> Varchar,
        usercomment -> Varchar,
        starttime -> Timestamptz,
        gettinghelp -> Bool,
        helper -> Varchar,
        help -> Bool,
        badlocation -> Bool,
    }
}

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

joinable!(queue_entries -> queues (queue_id));
joinable!(queue_entries -> users (user_id));

allow_tables_to_appear_in_same_query!(
    queue_entries,
    queues,
    users,
);
