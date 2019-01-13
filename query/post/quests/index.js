const express = require('express');
const mysql = require('mysql');
const winston = require('winston');
const fs = require('fs');
const crypto = require('crypto');

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
        const notImportantSalt = 'abc123';
        const base64Data = imgVal.replace(/^data:image\/png;base64,/, '');
        const hash = crypto.createHmac('sha256', notImportantSalt).update(`${res.userName}${imgVal}`).digest('hex');
        fs.writeFile(`../quest_images/${hash}.png`, base64Data, 'base64', async (err) => {
            if (err) console.log(err);
            else {
                try {
                    const query = `INSERT INTO quest_entries (created_by, class_code, quest_id, entry, image, critical, creative, responsible, image_url)
                        select id, class_code, '${questId}', ?, ?, ${Number(critical)}, ${Number(creative)}, ${Number(responsible)}, '${hash}.png'
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
                } catch (error) {
                    logger.log('error', error.toString());
                    throw new Error(error);
                }
            }
        });
    } catch (e) {
        logger.log('error', e.toString());
        throw new Error(e);
    }
});

router.post('/comment/submit', (req, res) => {
    const {
        questEntryId,
        comment,
        glowGrow,
    } = req.body;
    const query = `INSERT INTO quest_comments (created_by, quest_entry_id, comment, glow_grow)
        select id, ${Number(questEntryId)}, ?, ${glowGrow}
        from users where username = '${res.userName}'`;

    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            logger.log('error', err.toString());
            throw err;
        }

        connection.query(query, [comment], (error, results) => {
            if (error) throw error;
            const query2 = `SELECT q.*, u.first_name, last_name, u.icon, q.glow_grow
                FROM quest_comments q
                JOIN users u on u.id = q.created_by
                WHERE q.id = ${results.insertId}
            `;
            connection.query(query2, (error2, results2) => {
                if (error2) {
                    connection.release();
                    logger.log('error', error2.toString());
                    throw error2;
                }
                res.send(results2);
            });
        });

        connection.release();
    });
});

router.post('/comment/vote', async (req, res) => {
    const {
        commentId,
        type,
    } = req.body;

    try {
        const query2 = `SELECT id FROM users WHERE userName = '${res.userName}'`;
        const result2 = await awaitQuery.query(query2);
        const userId = result2[0].id;
        const query = `SELECT * FROM comment_votes WHERE comment_id = ${commentId} and created_by = ${userId}`;
        const result = await awaitQuery.query(query);
        if (result.length > 0) {
            // update
            const query3 = `UPDATE comment_votes SET type = '${type}' WHERE created_by = ${userId} and comment_id = ${commentId}`;
            await awaitQuery.query(query3);
        } else {
            // insert
            const query4 = `INSERT INTO comment_votes (created_by, comment_id, type) VALUES (${userId}, ${commentId}, '${type}')`;
            await awaitQuery.query(query4);
        }
        res.send({ success: true });
    } catch (error) {
        logger.log('error', error.toString());
        throw new Error(error);
    }
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
        const query3 = `SELECT q.*, u.first_name, u.last_name, u.icon
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
