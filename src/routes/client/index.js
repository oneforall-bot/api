const router = require('express').Router()
const {encrypt, decrypt} = require("../../utils/functions");

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const client = req.app.get('clients').filter(client => client.discordId === id)
    if(!client) return res.status(404).json({message: 'Client not found'})
    const data = client.map((manager) => {
        return {
           ...manager.options,
            token: decrypt(manager.options.token)
        }
    })
    res.status(200).json(data)
})


router.get('/', async (req, res) => {
    res.status(200).json({message: 'Hello from oneforall'})
})

router.post('/new', async (req, res) => {
    const {discordId, token, guildIds, maxGuilds, licenseKey, botId, expiredAt, createdAt, owners} = req.body
    const clientsManager = req.app.get('clients')
    const isClient = clientsManager.has(`${discordId}-${botId}`)
    if (isClient) return res.status(404).json({error: 'Client already exists'})
    const encryptedToken = encrypt(token).toString()
    clientsManager.getAndCreateIfNotExists(`${discordId}-${botId}`, {
        licenseKey,
        token: encryptedToken,
        prefix: `.`,
        maxGuilds,
        guildIds,
        expiredAt,
        createdAt,
        owners,
        client: discordId,
        __dirname: req.app.get('config').botPersoPath
    })
    req.app.get('database').models.clients.create({discordId, token: encryptedToken, botId, expiredAt, createdAt, licenseKey, guildIds, owners}).then(() => {
       res.status(200).json({message: 'Client created successfully'})
    })
})

router.delete('/:discordId/:botId', async (req, res) => {
    const {discordId, botId} = req.params;
    const clientsManager = req.app.get('clients')
    const isClient = clientsManager.getIfExist(`${discordId}-${botId}`)
    if (!isClient) return res.status(404).json({error: 'Client does not exists'})
    isClient.delete()
    res.status(200).json({message: 'Client deleted successfully'})
})


router.patch('/:discordId/:botId', async (req, res) => {
    const {discordId, botId} = req.params.id;
    const editedOptions = req.body
    const client = req.app.get('clients').find(client => client.discordId === discordId && client.botId === botId)
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

router.get('/restart/:discordId/:botId', async (req, res) => {
    const {discordId, botId} = req.params;
    const client = req.app.get('clients').find(client => client.discordId === discordId && client.botId === botId)
    console.log(req.app.get('clients'))
    if(!client) return res.status(404).json({message: 'Not found'})
    client.restart()
    res.status(200).json({message: 'Successfully restarted'})
})

module.exports = router
