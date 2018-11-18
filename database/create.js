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
            username VARCHAR(64) NOT NULL,
            password VARCHAR(32) NOT NULL,
            create_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            icon VARCHAR(64) NULL,
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
        PRIMARY KEY(id))
    `;

    connection.query(sql, (queryErr) => {
        if (queryErr) throw err;
    });

    connection.end();
});
