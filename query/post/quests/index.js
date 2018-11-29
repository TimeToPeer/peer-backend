const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');
const pool = require('../../../database/pool');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/submit', (req, res) => {
    const {
        entry,
        imgVal,
        questId,
        critical,
        creative,
        responsible,
    } = req.body;
    const query = `INSERT INTO quest_entries (created_by, class_code, quest_id, entry, image, critical, creative, responsible)
        select id, class_code, '${questId}', '${entry}', ?, ${Number(critical)}, ${Number(creative)}, ${Number(responsible)}
        from users where username = '${res.userName}'`;
    queryDb(query, req, res, [imgVal]);
});

router.post('/comment/submit', (req, res) => {
    const {
        questEntryId,
        comment,
    } = req.body;
    const query = `INSERT INTO quest_comments (created_by, quest_entry_id, comment)
        select id, ${Number(questEntryId)}, ?
        from users where username = '${res.userName}'`;

    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            throw err;
        }

        connection.query(query, [comment], (error, results) => {
            if (error) throw error;
            // const shit = results.map(el => el.id);
            const query2 = `SELECT q.*, u.name, u.icon
                FROM quest_comments q
                JOIN users u on u.id = q.created_by
                WHERE q.id = ${results.insertId}
            `;
            connection.query(query2, (error2, results2) => {
                if (error2) throw error;
                res.send(results2);
            });
        });

        connection.release();
    });
});

module.exports = router;
