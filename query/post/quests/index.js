const express = require('express');

const router = express.Router();
const queryDb = require('../../../database/query');
const pool = require('../../../database/pool');
const awaitQuery = require('../../../database/awaitQuery');

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

router.post('/assessment/feedback', async (req, res) => {
    const {
        id, critical, creative, responsible, comment,
    } = req.body;
    const query = `
        UPDATE quest_entries
        SET teacher_critical = ${Number(critical)}, teacher_creative = ${Number(creative)}, teacher_responsible = ${Number(responsible)}
        WHERE id = '${id}'
    `;
    const query2 = `
        INSERT INTO feedback (created_by, quest_entry_id, comment)
        SELECT id, '${id}', '${comment}'
        FROM users where username = '${res.userName}'
    `;
    try {
        let entry = {};
        if (critical > 0 && creative > 0 && responsible > 0) {
            await awaitQuery.query(query);
            const query4 = `
                SELECT *
                FROM quest_entries
                WHERE id = '${id}'
            `;
            entry = await awaitQuery.query(query4);
        }
        const result = await awaitQuery.query(query2);
        const query3 = `SELECT q.*, u.name, u.icon
            FROM feedback q
            JOIN users u on u.id = q.created_by
            WHERE q.id = ${result.insertId}
        `;
        const result2 = await awaitQuery.query(query3);
        res.send({
            feedback: result2,
            entry,
        });
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = router;
