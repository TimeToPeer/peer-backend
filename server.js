require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const getUsers = require('./query/get/users');
const postUsers = require('./query/post/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use('/get/users', getUsers);
app.use('/post/users', postUsers);

app.listen(8080, () => {});

process.on('uncaughtException', (err) => {
    console.log(err);
});
