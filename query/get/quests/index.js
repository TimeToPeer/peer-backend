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

router.post('/id', (req, res) => {
    const { questId } = req.body;
    const query = `SELECT q.id as questid, q.class_code, q.title, q.description, q.create_time, c.*, u.name, u.icon
        FROM peer.quests q
        JOIN peer.classroom c ON q.class_code = c.id
        JOIN peer.users u on u.id = c.teacher_id
        WHERE q.id = ${questId}`;
    queryDb(query, req, res);
});

// quest title, teacher name, entry, student name
router.post('/entry/asessment', async (req, res) => {
    const { entryId } = req.body;
    let query = '';
    if (res.type === 1) {
        query = `
            SELECT e.*, u.name as name, u.icon, ${res.type} as userType
            FROM quest_entries e
            JOIN classroom c on c.id = e.class_code
            JOIN users tu on tu.id = c.teacher_id
            JOIN users u on u.id = e.created_by
            WHERE e.id = ${entryId} and tu.username = '${res.userName}'
        `;
    } else {
        query = `
            SELECT e.*, u.name, u.icon
            FROM quest_entries e
            JOIN users u on e.created_by = u.id
            WHERE e.id = ${entryId} and u.username = '${res.userName}'
        `;
    }

    try {
        const result = await awaitQuery.query(query);
        const query2 = `SELECT q.*, u.name, u.icon
            FROM quest_comments q
            JOIN users u on u.id = q.created_by
            WHERE q.quest_entry_id = ${result[0].id}
            order by q.created_on ASC
        `;
        const result2 = await awaitQuery.query(query2);

        const query3 = `
                SELECT q.*, u.name, u.icon
                FROM feedback q
                JOIN users u on u.id = q.created_by
                WHERE q.quest_entry_id = (${entryId})
                order by q.created_on ASC
        `;
        const result3 = await awaitQuery.query(query3);

        const dataToSend = {
            entries: result,
            comments: result2,
            feedback: result3,
        };
        res.send(dataToSend);
    } catch (err) {
        throw new Error(err);
    }
    // queryDb(query, req, res);
});

// get entries and comments
router.post('/entries', (req, res) => {
    const query = `SELECT q.id, q.created_by, q.created_on, q.class_code, q.quest_id as questId, q.entry, q.image, u.name, u.icon
        FROM quest_entries q
        JOIN users u on u.id = q.created_by
        WHERE q.class_code in (SELECT class_code from users where username = '${res.userName}')
        order by q.created_on DESC
    `;
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            throw err;
        }

        connection.query(query, (error, results) => {
            if (error) throw error;
            if (results.length > 0) {
                const entryIds = results.map(el => el.id);
                const query2 = `SELECT q.*, u.name, u.icon
                    FROM quest_comments q
                    JOIN users u on u.id = q.created_by
                    WHERE q.quest_entry_id in (${entryIds})
                    order by q.created_on ASC
                `;
                connection.query(query2, (error2, results2) => {
                    if (error2) throw error;
                    const dataToSend = {
                        entries: results,
                        comments: results2,
                    };
                    res.send(dataToSend);
                });
            } else {
                res.send({});
            }
        });

        connection.release();
    });
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

router.post('/comments', (req, res) => {
    const { questEntryId } = req.body;
    const query = `
        SELECT c.* FROM quest_comments c
        join users u on u.id = c.create_by
        where c.quest_entry_id = ?;
    `;
    queryDb(query, req, res, [questEntryId]);
});

router.post('/skills', async (req, res) => {
    try {
        const query = `
                SELECT AVG(NULLIF(critical ,0)) as critical, AVG(NULLIF(creative ,0)) as creative,
                AVG(NULLIF(responsible ,0)) as responsible, AVG(NULLIF(teacher_critical ,0)) as teacher_critical,
                AVG(NULLIF(teacher_creative ,0)) as teacher_creative,
                AVG(NULLIF(teacher_responsible ,0)) as teacher_responsible
                FROM peer.quest_entries q
                JOIN users u on q.created_by = u.id
                WHERE u.username = '${res.userName}'
                GROUP BY q.created_by
        `;
        const result = await awaitQuery.query(query);
        res.send(result);
    } catch (e) {
        throw new Error(e);
    }
});

router.post('/classroom', async (req, res) => {
    const { questId } = req.body;
    if (res.type === 1) {
        try {
            const classcodeQuery = `
                SELECT class_code
                FROM users
                WHERE username = '${res.userName}'
            `;

            const classcodeResult = await awaitQuery.query(classcodeQuery);
            const classCode = classcodeResult[0].class_code;

            const query = `
                SELECT q.created_by, COUNT(*) as post_count, COUNT(teacher_critical) as assessed_count,
                AVG(NULLIF(critical ,0)) as critical, AVG(NULLIF(creative ,0)) as creative,
                AVG(NULLIF(responsible ,0)) as responsible, AVG(NULLIF(teacher_critical ,0)) as teacher_critical,
                AVG(NULLIF(teacher_creative ,0)) as teacher_creative,
                AVG(NULLIF(teacher_responsible ,0)) as teacher_responsible
                FROM peer.quest_entries q
                JOIN users u on q.created_by = u.id
                WHERE q.quest_id = ${Number(questId)} and u.class_code = '${classCode}'
                GROUP BY q.created_by
            `;
            const query2 = `
                SELECT id, name FROM users
                WHERE username != '${res.userName}' AND class_code = '${classCode}'
            `;
            const query3 = `
                SELECT f.quest_entry_id, e.created_by, MAX(f.created_on) as lastest_feedback
                FROM feedback f
                join quest_entries e on f.quest_entry_id = e.id
                JOIN users u on u.id = e.created_by
                WHERE e.quest_id = ${Number(questId)} and u.class_code = '${classCode}'
                GROUP BY e.created_by
            `;
            const query4 = `
                SELECT c.*, e.quest_id, cu.name, cu.icon, CONCAT(cu.name, '  commented on ', pu.name, '\\'s post') as special_text
                FROM quest_comments c
                JOIN quest_entries e on e.id = c.quest_entry_id
                JOIN users cu on cu.id = c.created_by
                JOIN users pu on pu.id = e.created_by
                WHERE e.quest_id = ${Number(questId)} and cu.class_code = '${classCode}' 
            `;
            const result = await awaitQuery.query(query);
            const result2 = await awaitQuery.query(query2);
            const result3 = await awaitQuery.query(query3);
            const result4 = await awaitQuery.query(query4);

            const dataToSend = {
                entry: result,
                students: result2,
                feedback: result3,
                comments: result4,
            };
            res.send(dataToSend);
        } catch (e) {
            throw new Error(e);
        }
    } else {
        res.send();
    }
});

module.exports = router;
