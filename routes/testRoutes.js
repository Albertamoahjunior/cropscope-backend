const express = require('express');
const router = express.Router();

const pingSite = (req, res) =>{
    res.send("OK");
}

router.get('/', pingSite);

module.exports = router;

