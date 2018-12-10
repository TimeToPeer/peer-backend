const express = require('express');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const mainHelper = require('helper/main-helper');
const pool = require('../../../database/pool.js');
const conf = require('../../../config/conf');


const router = express.Router();
const queryDb = require('../../../database/query');

const logger = winston.createLogger({
    level: 'error',
    transports: [
        new (winston.transports.File)({ filename: 'error.log' }),
    ],
});


// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

const createJwt = obj => jwt.sign(obj, conf.key, { expiresIn: '5h' });


router.post('/create_account', (req, res) => {
    const { userName, password } = req.body;
    const query1 = `SELECT password, type FROM users where username = '${userName}'`;
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            logger.log('error', err.toString());
            throw err;
        }

        // check if user exists in database
        connection.query(query1, (error, results) => {
            if (err) {
                connection.release();
                throw err;
            }
            if (results && results[0]) {
                const hash = results[0].password;
                const { type } = results[0];
                mainHelper.comparePassword(password, hash).then((result) => {
                    // only students can create accounts at the moment so they will all be type 2
                    // teachers will have to be created by the admins
                    const token = createJwt({ userName, type });
                    res.send({
                        success: result,
                        token,
                    });
                });
                connection.release();
            } else {
                // create user if user doesn't exist
                mainHelper.createSaltHashPassword(password).then((hashedPassword) => {
                    const query2 = `INSERT INTO users (username, password, type) 
                        VALUES ('${userName}', '${hashedPassword}', '2')`;
                    connection.query(query2, (insertError, insertResult) => {
                        if (insertError) {
                            connection.release();
                            logger.log('error', err.toString());
                            throw err;
                        }

                        // only students can create accounts at the moment
                        // so they will all be type 2
                        // teachers will have to be created by the admins
                        if (insertResult.affectedRows === 1) {
                            const token = createJwt({ userName, type: 2 });
                            res.send({
                                success: true,
                                token,
                            });
                        } else {
                            res.send({
                                success: false,
                            });
                        }
                        connection.release();
                    });
                });
            }
        });
    });
});

router.post('/update_account', (req, res) => {
    const {
        name, class_code: classCode, personality, icon,
    } = req.body;
    const query = `UPDATE users SET name='${name}', class_code='${classCode}', school_code=0, personality='${personality}', icon='${icon}' WHERE username='${res.userName}'`;
    queryDb(query, req, res);
});

router.post('/logout_user', (req, res) => {
    const token = req.headers.authorization;
    const payload = jwt.verify(token, conf.key);
    delete payload.iat;
    delete payload.exp;
    delete payload.nbf;
    delete payload.jti;

    res.send({ success: true, message: 'logout successful' });
});


module.exports = router;
