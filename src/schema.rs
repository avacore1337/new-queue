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

allow_tables_to_appear_in_same_query!(
    kthuser,
    posts,
);
