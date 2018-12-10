const mysql = require('mysql');
const { db } = require('../config/conf.json');
const mainHelper = require('../helper/main-helper');

const connection = mysql.createConnection(db);

connection.connect((err) => {
    if (err) throw err;

    let sql = 'DELETE FROM users';

    connection.query(sql, (err1, result) => {
        if (err1) throw err1;
        console.log(err1, result);
    });

    mainHelper.createSaltHashPassword('password').then((hashedPassword) => {
        for (let i = 0; i < 9; i += 1) {
            sql = `INSERT INTO users (username, password, type, class_code, school_code, personality, name) 
                    VALUES ('test.teacher${i}', '${hashedPassword}', '1', '100${i}', '1000', 'test', 'test teacher${i}')`;

            connection.query(sql, (err2, result) => {
                if (err2) throw err2;
                console.log(err2, result);
            });

            sql = `INSERT INTO classroom (id, teacher_id, class_name)
                    VALUES ('100${i}', ${i + 1}, 'pilot class')`;

            connection.query(sql, (err2, result) => {
                if (err2) throw err2;
                console.log(err2, result);
            });

            sql = `INSERT INTO quests (class_code, title, description, active)
                    VALUES ('100${i}', 'Pilot', 'Your QUEST is...', 1)`;

            connection.query(sql, (err2, result) => {
                if (err2) throw err2;
                console.log(err2, result);
            });
        }

        connection.end();
    });
});
