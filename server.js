require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const getUsers = require('./query/get/users');
const postUsers = require('./query/post/users');
const config = require('./config/conf');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'POST') {
        if (req.url.indexOf('/post/users/create_account') > -1) {
            next();
        } else {
            jwt.verify(req.body.token, config.key, (err, decoded) => {
                if (err) res.send({ success: false });
                if (decoded) next();
            });
        }
    } else {
        next();
    }
});

app.use('/get/users', getUsers);
app.use('/post/users', postUsers);

app.listen(8080, () => {});

process.on('uncaughtException', (err) => {
    console.log(err);
});
