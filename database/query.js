const pool = require('./pool.js');

module.exports = (query, req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            throw err;
        }

        connection.query(query, (error, results) => {
            if (error) throw error;
            res.send(results);
        });

        connection.release();
    });
};
