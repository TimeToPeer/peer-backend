const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.send('hello world');
});

var server = app.listen(8080, function() {
    console.log('listening on port 8080...');
});


var mysql = require('mysql');
const conf = require('./config/conf.json');
var connection = mysql.createConnection(conf.db);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM users";
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
    });
    connection.end();
});
