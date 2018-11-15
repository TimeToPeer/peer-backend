var mysql = require('mysql');
const { db } = require('../config/conf.json');

var connection = mysql.createConnection(db);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    var sql = `DELETE FROM users`;

    connection.query(sql, function (err, result) {
        console.log(err, result);
    });


    for (var i = 0; i < 1; i++) {
        var sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('test.teacher1', 'password', '1', '1000', '1000', 'test')`;

        connection.query(sql, function (err, result) {
            console.log(err, result);
        });

        var sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('test.teacher1', 'password', '1', '1001', '1000', 'test')`;

        connection.query(sql, function (err, result) {
            console.log(err, result);
        });
    }

    for (var i = 0; i < 60; i++) {
        var name = 'test.student'+i;
        var classCode = i < 30 ? '1000' : '1001';
        var sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('${name}', 'password', '2', '${classCode}', '1000', 'test')`;

        connection.query(sql, function (err, result) {
            console.log(err, result);
        });
    
    }
    connection.end();
});
