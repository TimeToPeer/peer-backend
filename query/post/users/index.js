const express = require('express');
const mainHelper = require('helper/main-helper');

const router = express.Router();
// const queryDb = require('../../../database/query');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log(req.method, Date.now(), req.url, req.ip);
    next();
});

router.post('/create_account', (req, res) => {
    console.log(req.headers);
    const { password } = req.body;
    mainHelper.createSaltHashPassword(password).then((result) => {
        res.send({
            success: true,
        });
    }).catch((error) => {
        res.send({
            success: false,
            errorCode: -1,
            reason: 'Failed to create account. Password creation failed',
        });
        console.log(error);
    });
});


module.exports = router;
