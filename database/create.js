var mysql = require('mysql');
const { db } = require('../config/conf.json');

var connection = mysql.createConnection(db);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    // create users table
    var sql = `
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
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("users table created");
    });

    // create classroom table
    var sql = `
        CREATE TABLE IF NOT EXISTS classroom (
            id VARCHAR(32) NOT NULL,
            teacher_id INT NOT NULL,
            class_name VARCHAR(32) NOT NULL,
        PRIMARY KEY(id))
    `;

    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("class_code table created");
    });

    // create quests
    var sql = `
        CREATE TABLE IF NOT EXISTS quests (
            id INT NOT NULL AUTO_INCREMENT,
            class_code VARCHAR(32) NOT NULL,
            title VARCHAR(64) NOT NULL,
            description TEXT NOT NULL,
            create_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(id))
    `;

    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("quest table created");
    });
    

    connection.end();
});
