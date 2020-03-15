table! {
    admin (id) {
        id -> Int4,
        admin_id -> Int4,
        queue_id -> Int4,
        added_by -> Nullable<Int4>,
    }
}

table! {
    kthuser (id) {
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
    queue (id) {
        id -> Int4,
        locked -> Bool,
        hiding -> Bool,
        motd -> Varchar,
        info -> Varchar,
    }
}

joinable!(admin -> queue (queue_id));

allow_tables_to_appear_in_same_query!(
    admin,
    kthuser,
    posts,
    queue,
);
