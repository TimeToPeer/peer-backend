require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const getUsers = require('./query/get/users');
const getQuests = require('./query/get/quests');
const postUsers = require('./query/post/users');
const postQuests = require('./query/post/quests');
const config = require('./config/conf');

app.use(bodyParser.json({ limit: '6mb' }));
app.use(bodyParser.urlencoded({ limit: '6mb', extended: true }));

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
            const token = req.headers.authorization;
            jwt.verify(token, config.key, (err, decoded) => {
                try {
                    if (err) throw err;
                    if (decoded) res.userName = decoded.userName; next();
                } catch (e) {
                    res.statusMessage = err.name;
                    res.status(400).send({
                        success: false,
                    });
                }
            });
        }
    } else {
        next();
    }
});

app.use('/get/users', getUsers);
app.use('/get/quests', getQuests);
app.use('/post/users', postUsers);
app.use('/post/quests', postQuests);

app.listen(8080, () => {});

process.on('uncaughtException', (err) => {
    console.log(err);
});
