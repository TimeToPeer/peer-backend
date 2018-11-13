var express = require('express')
var router = express.Router()
var queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})

router.get('/:id', function (req, res) {
    var query = `SELECT * FROM users WHERE username='${req.params.id}' LIMIT 0,1`;
    queryDb(query, req, res);
})

router.get('/type/:type', function (req, res) {
    var query = `SELECT * FROM users WHERE type='${req.params.type}'`;
    queryDb(query, req, res);
})

router.get('/class/:id', function (req, res) {
    var query = `SELECT * FROM users WHERE class_code='${req.params.id}'`;
    queryDb(query, req, res);
})

module.exports = router;