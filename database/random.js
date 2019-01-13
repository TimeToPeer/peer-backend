/* eslint no-loop-func: "off" */
const mysql = require('mysql');
const { db } = require('../config/conf.json');
const mainHelper = require('../helper/main-helper');

const connection = mysql.createConnection(db);

connection.connect((err) => {
    if (err) throw err;

    let sql = '';

    mainHelper.createSaltHashPassword('password').then((hashedPassword) => {
        for (let i = 9; i < 14; i += 1) {
            sql = `INSERT INTO users (username, password, type, class_code, school_code, personality, first_name, last_name) 
                    VALUES ('test.teacher${i}', '${hashedPassword}', '1', '${1000 + i}', '1000', 'test', 'test', 'teacher${i}')`;

            connection.query(sql, (err2, result) => {
                if (err2) throw err2;
                console.log(err2, result);
                sql = `INSERT INTO classroom (id, teacher_id, class_name)
                            VALUES ('${1000 + i}', ${result.insertId}, 'pilot class')`;

                connection.query(sql, (err3, result2) => {
                    if (err3) throw err3;
                    console.log(err3, result2);
                });
                sql = `INSERT INTO quests (class_code, title, description, active)
                        VALUES ('${1000 + i}', 'Pilot', 'Your QUEST is...', 1)`;

                connection.query(sql, (err4, result3) => {
                    if (err4) throw err4;
                    console.log(err2, result3);
                });
            });
        }
    });
});
