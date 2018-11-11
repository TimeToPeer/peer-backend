var mysql = require('mysql');
const { db } = require('../config/conf.json');

var connection = mysql.createConnection(db);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(64) NOT NULL,
            password VARCHAR(32) NOT NULL,
            create_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            TYPE INT NULL,
        PRIMARY KEY(id))
    `;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    
    connection.end();
});
