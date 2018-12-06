const util = require('util');
const pool = require('./pool');

pool.query = util.promisify(pool.query); // Magic happens here.
module.exports = pool;
