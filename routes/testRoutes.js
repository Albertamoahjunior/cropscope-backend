const express = require('express');
const router = express.Router();

const pingSite = (req, res) =>{
    res.sendStatus(200);
}

router.get('/', pingSite);

module.exports = router;

