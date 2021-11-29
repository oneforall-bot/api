const express = require('express'),
    app = express(),
    cors = require('cors'),
    config = require('./config'),
    routes = require('./routes'),
    Database = require('./Database'),
    cron = require('node-cron'),
    {deleteIfExpired, encrypt} = require("./utils/functions");
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
const database = new Database(app)
app.set('database', database)
app.set('config', config)
app.use((req, res, next) => {
    const apiKey = req.get('Authorization');
    if (!apiKey || apiKey !== config.apiKey)
        return res.status(401).json({error: 'Unauthorized'});
    next()
})


app.use('/api', routes)

cron.schedule('0 0 * * *', () => {
    deleteIfExpired(app.get('clients'))
})

app.listen(config.port, () => console.log('Api is running at http://localhost:' + config.port))
