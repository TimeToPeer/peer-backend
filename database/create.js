const mysql = require('mysql');
const { db } = require('../config/conf.json');

const connection = mysql.createConnection(db);

connection.connect((err) => {
    if (err) throw err;
    let sql = '';
    // create users table
    sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(256) NULL,
            password VARCHAR(256) NOT NULL,
            create_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            icon VARCHAR(64) DEFAULT 0,
            type INT NULL,
            class_code VARCHAR(32) NULL,
            school_code INT NULL,
            personality VARCHAR(32) NULL,
        PRIMARY KEY(id))
    `;
    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    // create classroom table
    sql = `
        CREATE TABLE IF NOT EXISTS classroom (
            id VARCHAR(32) NOT NULL,
            teacher_id INT NOT NULL,
            class_name VARCHAR(32) NOT NULL,
        PRIMARY KEY(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    // create quests
    sql = `
        CREATE TABLE IF NOT EXISTS quests (
            id INT NOT NULL AUTO_INCREMENT,
            class_code VARCHAR(32) NOT NULL,
            title VARCHAR(64) NOT NULL,
            description TEXT NOT NULL,
            create_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            active TINYINT(1) NOT NULL,
        PRIMARY KEY(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    // create quest entry table
    sql = `
        CREATE TABLE IF NOT EXISTS peer.quest_entries (
            id int not null AUTO_INCREMENT,
            created_by int not null,
            created_on timestamp null default current_timestamp,
            class_code varchar(32) not null,
            quest_id int not null,
            entry text not null,
            image MEDIUMTEXT not null,
            critical int not null,
            creative int not null,
            responsible int not null,
            teacher_critical int null,
            teacher_creative int null,
            teacher_responsible int null,
        Primary key(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    // create quest entry comment table

    sql = `
        CREATE TABLE IF NOT EXISTS peer.quest_comments (
            id int not null AUTO_INCREMENT,
            created_by int not null,
            created_on timestamp null default current_timestamp,
            quest_entry_id int not null,
            comment VARCHAR(2000) not null,
        Primary key(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    // create teacher feedback

    sql = `
        CREATE TABLE IF NOT EXISTS peer.feedback (
            id int not null AUTO_INCREMENT,
            created_by int not null,
            created_on timestamp null default current_timestamp,
            quest_entry_id int not null,
            comment VARCHAR(2000) not null,
        PRIMARY KEY(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    connection.end();
});
