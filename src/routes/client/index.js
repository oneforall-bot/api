const router = require('express').Router()
const {encrypt, decrypt} = require("../../utils/functions");

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const client = req.app.get('clients').getIfExist(id)
    if(!client) return res.status(404).json({message: 'Client not found'})
    const data = {...client.options, token: decrypt(client.options.token)}
    res.status(200).json(data)
})


router.get('/', async (req, res) => {
    res.status(200).json({message: 'Hello from oneforall'})
})

router.post('/new', async (req, res) => {
    const {discordId, token, guildIds, maxGuilds, licenseKey, botId, expiredAt, createdAt, owners} = req.body
    const clientsManager = req.app.get('clients')
    const isClient = clientsManager.has(discordId)
    if (isClient) return res.status(404).json({error: 'Client already exists'})
    const encryptedToken = encrypt(token).toString()
    clientsManager.getAndCreateIfNotExists(discordId, {
        licenseKey,
        token: encryptedToken,
        prefix: `.`,
        maxGuilds,
        guildIds,
        owners,
        client: discordId,
        __dirname: req.app.get('config').botPersoPath
    })
    req.app.get('database').models.clients.create({discordId, token: encryptedToken, botId, expiredAt, createdAt, licenseKey, guildIds, owners}).then(() => {
       res.status(200).json({message: 'Client created successfully'})
    })
})

router.delete('/:id', async (req, res) => {
    const discordId = req.params.id;
    const clientsManager = req.app.get('clients')
    const isClient = clientsManager.has(discordId)
    if (!isClient) return res.status(404).json({error: 'Client does not exists'})
    clientsManager.getIfExist(discordId).delete()
    res.status(200).json({message: 'Client deleted successfully'})
})


router.patch('/:id', async (req, res) => {
    const discordId = req.params.id;
    const editedOptions = req.body
    const client = req.app.get('clients').getIfExist(discordId)
    if(editedOptions.token){
        editedOptions.token = encrypt(editedOptions.token).toString()
    }
    client.options = Object.assign(client.options,editedOptions)
    client.oneforall.config = Object.assign(client.options, editedOptions)
    client.restart()
    client.save().then(() => {
        res.status(200).json({message: 'Client edited successfully'})
    })
})

router.get('/restart/:id', async (req, res) => {
    const discordId = req.params.id;
    const client = req.app.get('clients').getIfExist(discordId)
    if(!client) return res.status(404).json({message: 'Not found'})
    client.restart()
    res.status(200).json({message: 'Successfully restarted'})
})

module.exports = router
