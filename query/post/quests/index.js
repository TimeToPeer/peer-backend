const express = require('express');
const mysql = require('mysql');
const winston = require('winston');

const router = express.Router();
const pool = require('../../../database/pool');
const awaitQuery = require('../../../database/awaitQuery');

const logger = winston.createLogger({
    level: 'error',
    transports: [
        new (winston.transports.File)({ filename: 'error.log' }),
    ],
});


// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/submit', async (req, res) => {
    const {
        entry,
        imgVal,
        questId,
        critical,
        creative,
        responsible,
    } = req.body;
    try {
        const query = `INSERT INTO quest_entries (created_by, class_code, quest_id, entry, image, critical, creative, responsible)
            select id, class_code, '${questId}', ?, ?, ${Number(critical)}, ${Number(creative)}, ${Number(responsible)}
            from users where username = '${res.userName}'`;
        const formattedQuery = mysql.format(query, [entry, imgVal]);
        const result = await awaitQuery.query(formattedQuery);
        const query2 = `
            INSERT INTO feedback (created_by, quest_entry_id, comment)
            SELECT id, '${result.insertId}', 'has answered the quest!'
            FROM users where username = '${res.userName}'
        `;
        await awaitQuery.query(query2);
        res.send({ success: true });
    } catch (e) {
        logger.log('error', e.toString());
        throw new Error(e);
    }
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
            logger.log('error', err.toString());
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
                if (error2) throw error2;
                logger.log('error', error2.toString());
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
        SELECT id, '${id}', ?
        FROM users where username = '${res.userName}'
    `;
    const formattedQuery = mysql.format(query2, [comment]);
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
        const result = await awaitQuery.query(formattedQuery);
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
        logger.log('error', err.toString());
        throw new Error(err);
    }
});

module.exports = router;
