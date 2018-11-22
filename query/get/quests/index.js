const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/id', (req, res) => {
    const { questId } = req.body;
    const query = `SELECT q.id as questid, q.class_code, q.title, q.description, q.create_time, c.*, u.name, u.icon
        FROM peer.quests q
        JOIN peer.classroom c ON q.class_code = c.id
        JOIN peer.users u on u.id = c.teacher_id
        WHERE q.id = ${questId}`;
    queryDb(query, req, res);
});

router.post('/entry', (req, res) => {
    const { questId } = req.body;
    const query = `SELECT q.*
        FROM quest_entries q
        JOIN users u on u.id = q.created_by
        WHERE u.username = '${res.userName}' and q.quest_id = '${questId}'`;
    queryDb(query, req, res);
});

router.post('/entries', (req, res) => {
    const query = `SELECT q.*, u.name, u.icon
        FROM quest_entries q
        JOIN users u on u.id = q.created_by
        WHERE q.class_code in (SELECT class_code from users where username = ?)
        order by q.created_on DESC
    `;
    queryDb(query, req, res, [res.userName]);
});

router.post('/inventory', (req, res) => {
    const query = `
        SELECT q.* FROM quests q
        join classroom c on q.class_code = c.id
        join users u on u.class_code = q.class_code
        where username = ?;
    `;
    queryDb(query, req, res, [res.userName]);
});

module.exports = router;
