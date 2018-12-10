const winston = require('winston');
const pool = require('./pool.js');

const logger = winston.createLogger({
    level: 'error',
    transports: [
        new (winston.transports.File)({ filename: 'error.log' }),
    ],
});

module.exports = (query, req, res, placeholders) => {
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            logger.log('error', err.toString());
            throw err;
        }

        connection.query(query, placeholders, (error, results) => {
            if (error) {
                logger.log('error', error.toString());
                throw error;
            }
            res.send(results);
        });

        connection.release();
    });
};
