const bcrypt = require('bcrypt');

const saltRounds = 10;

const createSaltHashPassword = password => new Promise((resolve, reject) => (
    bcrypt.genSalt(saltRounds, (saltErr, salt) => {
        if (saltErr) reject(saltErr);
        bcrypt.hash(password, salt, (hashErr, hash) => {
            if (hashErr) reject(hashErr);
            resolve(hash);
        });
    })));

const comparePassword = (password, hash) => new Promise((resolve, reject) => (
    bcrypt.compare(password, hash, (err, res) => {
        if (err) reject(err);
        resolve(res);
    })));


module.exports = {
    createSaltHashPassword,
    comparePassword,
};
