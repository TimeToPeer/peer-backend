const mysql = require('mysql');
const { db } = require('../config/conf.json');

const connection = mysql.createConnection(db);

connection.connect((err) => {
    if (err) throw err;

    let sql = 'DELETE FROM users';

    connection.query(sql, (err1, result) => {
        if (err1) throw err1;
        console.log(err1, result);
    });


    for (let i = 0; i < 1; i += 1) {
        sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('test.teacher1', 'password', '1', '1000', '1000', 'test')`;

        connection.query(sql, (err2, result) => {
            if (err2) throw err2;
            console.log(err2, result);
        });

        sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('test.teacher1', 'password', '1', '1001', '1000', 'test')`;

        connection.query(sql, (err3, result) => {
            if (err3) throw err3;
            console.log(err3, result);
        });
    }

    for (let j = 0; j < 60; j += 1) {
        const name = `test.student${j}`;
        const classCode = j < 30 ? '1000' : '1001';
        sql = `INSERT INTO users (username, password, type, class_code, school_code, personality) 
                VALUES ('${name}', 'password', '2', '${classCode}', '1000', 'test')`;

        connection.query(sql, (err4, result) => {
            if (err4) throw err4;
            console.log(err4, result);
        });
    }

    connection.end();
});
