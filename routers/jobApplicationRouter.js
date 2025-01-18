const router = require('express').Router();
const db = require('../models');

router.get('/', async (req, res) => {
    const jobApp = "jobApp";

    return res.status(200).json(jobApp);
});


module.exports = router;