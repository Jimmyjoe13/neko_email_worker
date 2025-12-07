-- Table des utilisateurs
drop table if exists users;
create table if not exists users (
    username text primary key,
    password text not null,
    token text not null
);

-- Table des métadonnées utilisateurs
drop table if exists meta;
create table if not exists meta (
    token text primary key,
    is_admin boolean not null default 0,
    mail_num integer not null default 0,
    mail_size integer not null default 0
);

-- Table des emails (structure corrigée)
drop table if exists mail;
create table if not exists mail (
    token text not null,
    mail_id integer not null,
    mail_size integer not null,
    mail_content text not null,
    primary key (token, mail_id)
);

-- Insertion de l'utilisateur admin
insert into users (username, password, token) 
    values ('admin@nana-intelligence.fr', 'Jim13180@', 'eliana-gay-241217');

-- Insertion des métadonnées pour l'admin
insert into meta (token, is_admin, mail_num, mail_size)
    values ('eliana-gay-241217', 1, 0, 0);
