table! {
    admin (id) {
        id -> Int4,
        admin_id -> Int4,
        queue_id -> Int4,
        added_by -> Nullable<Int4>,
    }
}

table! {
    kthusers (id) {
        id -> Int4,
        username -> Varchar,
        ugkthid -> Varchar,
        realname -> Varchar,
        location -> Varchar,
        starttime -> Date,
        gettinghelp -> Bool,
        helper -> Varchar,
        help -> Bool,
        badlocation -> Bool,
    }
}

table! {
    posts (id) {
        id -> Int4,
        title -> Varchar,
        body -> Text,
        published -> Bool,
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

joinable!(admin -> queues (queue_id));

allow_tables_to_appear_in_same_query!(
    admin,
    kthusers,
    posts,
    queues,
);
