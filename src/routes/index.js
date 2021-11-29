const router = require('express').Router(),
    client = require('./client')

router.use('/client', client)

module.exports = router
