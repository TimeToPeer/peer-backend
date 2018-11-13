var mysql = require('mysql');
const { db } = require('../config/conf.json');

module.exports = mysql.createPool(db);