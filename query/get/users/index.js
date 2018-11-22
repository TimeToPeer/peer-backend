const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/', (req, res) => {
    const query = `SELECT name, class_code, school_code, personality, type, icon FROM users WHERE username='${res.userName}' LIMIT 0,1`;
    queryDb(query, req, res);
});

router.get('/type/:type', (req, res) => {
    const query = `SELECT * FROM users WHERE type='${req.params.type}'`;
    queryDb(query, req, res);
});

router.get('/class/:id', (req, res) => {
    const query = `SELECT * FROM users WHERE class_code='${req.params.id}'`;
    queryDb(query, req, res);
});

module.exports = router;
