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
    kthuser,
    posts,
    queue,
    queues,
    users,
);
