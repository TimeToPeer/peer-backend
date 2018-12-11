const fs = require('fs');
const crypto = require('crypto');
const awaitQuery = require('./awaitQuery');

async function sup() {
    console.log('yo');
    try {
        const query = `
            SELECT id, image, created_on
            FROM quest_entries;
        `;
        const result = await awaitQuery.query(query);
        const notImportantSalt = 'abc123';
        console.log(result.length);
        for (let i = 0; i < result.length; i += 1) {
            const { id, image } = result[i];
            const base64Data = image.replace(/^data:image\/png;base64,/, '');
            const hash = crypto.createHmac('sha256', notImportantSalt).update(`${id}${image}`).digest('hex');
            fs.writeFile(`../quest_images/${hash}.png`, base64Data, 'base64', async (err) => {
                if (err) console.log(err);
                else {
                    console.log(i);
                    const query1 = `
                        UPDATE quest_entries
                        SET image_url = '${hash}.png'
                        WHERE id = ${id}
                    `;
                    console.log(hash);
                    try {
                        const res = await awaitQuery.query(query1);
                        console.log(res.message);
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
}

sup();
