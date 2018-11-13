const express = require('express');
const app = express();
const users = require('./query/get/users');

app.use('/get/users', users);

var server = app.listen(8080, function() {
    console.log('listening on port 8080...');
});

process.on('uncaughtException', function(err) {
    console.log(err);
})
