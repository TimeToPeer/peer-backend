const fs = require('fs');
const crypto = require('crypto');
const awaitQuery = require('./awaitQuery');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function SplitName() {
    try {
        const query = `
            SELECT id, username
            FROM users;
        `;
        const result = await awaitQuery.query(query);
        console.log(result.length);
        for (let i = 0; i < result.length; i += 1) {
            const { id, username } = result[i];
            const firstName = capitalizeFirstLetter(username.split('.')[0]);
            const lastName = capitalizeFirstLetter(username.split('.')[1]);
            const query1 = `
                UPDATE users
                SET first_name = '${firstName}', last_name='${lastName}'
                WHERE id = ${id}
            `;
            try {
                const res = await awaitQuery.query(query1);
                console.log(res.message);
            } catch (error) {
                console.log(error);
            }
                
        }
    } catch (e) {
        console.log(e);
    }
}

SplitName();
