const express = require('express');
const jwt = require('jsonwebtoken');
const mainHelper = require('helper/main-helper');
const pool = require('../../../database/pool.js');
const conf = require('../../../config/conf');

const router = express.Router();
const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

const createJwt = obj => jwt.sign(obj, conf.key, { expiresIn: '1h' });


router.post('/create_account', (req, res) => {
    const { userName, password } = req.body;
    const query1 = `SELECT password FROM users where username = '${userName}'`;
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
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
                mainHelper.comparePassword(password, hash).then((result) => {
                    const token = createJwt({ userName });
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
                            throw err;
                        }

                        if (insertResult.affectedRows === 1) {
                            const token = createJwt({ userName });
                            res.send({
                                success: true,
                                token,
                            });
                        } else {
                            const token = createJwt({ userName });
                            res.send({
                                success: false,
                                token,
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
        name, class_code: classCode, school_code: schoolCode, personality,
    } = req.body.userInfo;

    const query = `UPDATE users SET name='${name}', class_code='${classCode}', school_code='${schoolCode}', personality='${personality}' WHERE username='${res.userName}'`;
    queryDb(query, req, res);
});


module.exports = router;
