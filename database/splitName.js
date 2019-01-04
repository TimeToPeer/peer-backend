const fs = require('fs');
const crypto = require('crypto');
const awaitQuery = require('./awaitQuery');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function SplitName() {
    try {
        const query = `
            SELECT id, username, name
            FROM users;
        `;
        const result = await awaitQuery.query(query);
        for (let i = 0; i < result.length; i += 1) {
            const { id, username } = result[i];
            let firstName = '';
            let lastName = '';
            let usernameSplit = username.split('.');
            if (usernameSplit[0]) {
                firstName = usernameSplit[0];
            } else {
                let usernameSplit = username.split(' ');
                firstName = usernameSplit[0];
            }
            if (usernameSplit[usernameSplit.length-1]) {
                lastName = usernameSplit[usernameSplit.length-1];
            } else {
                let usernameSplit = name.split(' ');
                lastName=usernameSplit[usernameSplit.length-1];
            }
            const firstNameFormat = capitalizeFirstLetter(firstName);
            const lastNameFormat = capitalizeFirstLetter(lastName);
            const query1 = `
                UPDATE users
                SET first_name = '${firstNameFormat}', last_name='${lastNameFormat}'
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
