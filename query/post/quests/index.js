const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/submit', (req, res) => {
    const { entry, questid } = req.body;
    const query = `INSERT INTO quest_entries (created_by, class_code, quest_id, entry)
        select id, class_code, '${questid}', ?
        from  users where username = '${res.userName}' ON DUPLICATE KEY UPDATE entry = ?`;
    queryDb(query, req, res, [entry, entry]);
});

module.exports = router;
