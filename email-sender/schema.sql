drop table if exists users;
create table if not exists users (
    username text primary key,
    password text not null,
    token text not null
);
insert into users (username, password, token) 
    values ('admin@nana-intelligence.fr', 'Jim13180@', 'eliana-gay-241217');

drop table if exists emails;
create table if not exists emails (
    id integer primary key autoincrement,
    sender text not null,
    receiver text not null,
    subject text,
    body text,
    timestamp integer not null
);
