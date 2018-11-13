var pool = require('./pool.js');

module.exports = function (query, req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            throw err;
        }
        
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.send(results);
        });

        connection.release();
    });
}