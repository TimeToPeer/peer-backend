const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/', (req, res) => {
    const query = `SELECT u.id, u.first_name, u.last_name, u.class_code, u.school_code, u.personality, u.type, u.icon,
        ((SELECT COUNT(*) FROM comment_votes v WHERE v.created_by = u.id and v.type = 'up') - (SELECT COUNT(*) FROM comment_votes v WHERE v.created_by = u.id and v.type = 'down')) as likes
        FROM users u WHERE u.username='${res.userName}' LIMIT 0,1`;
    queryDb(query, req, res);
});

router.post('/classroom', (req, res) => {
    const query = `SELECT u.id, u.first_name, u.last_name, u.class_code, u.school_code, u.personality, u.type, u.icon,
        ((SELECT COUNT(*) FROM comment_votes v WHERE v.created_by = u.id and v.type = 'up') - (SELECT COUNT(*) FROM comment_votes v WHERE v.created_by = u.id and v.type = 'down')) as likes
        FROM users u WHERE u.class_code = (SELECT uu.class_code FROM users uu WHERE uu.userName = '${res.userName}')`;
    queryDb(query, req, res);
});

module.exports = router;
