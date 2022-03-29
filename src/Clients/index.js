const {Collection} = require('../utils/collection'),
    config = require('../config'),
    {sleep} = require('../utils/functions'),
    moment = require('moment')
const {decrypt, deleteIfExpired} = require("../utils/functions");

class Clients extends Collection {
    constructor(database) {
        super()
        this.database = database
        this.loadClients().then(() => {
            deleteIfExpired(this)
        })
    }

    async loadClients() {
        for await (const client of (await this.database.models.clients.findAll())) {
            this.add(`${client.get('discordId')}-${client.get('botId')}`, client.get())
            await sleep(1000)
        }
    }

    getIfExist(key) {
        return this.has(key) ? this.get(key) : null;
    }

    add(key, value = {}) {
        return this.set(key, new ClientManager(this, value, key)).get(key);
    }

    getAndCreateIfNotExists(key, values = {}) {
        return this.has(key) ? this.get(key) : this.add(key, values);
    }


}

class ClientManager {
    constructor(clients, options, key) {
        options.client = key.split('-')[0] || options.discordId
        for (const property in options) this[property] = options[property]
        this.key = key
        this.clients = clients
        this.options = options
        this.deleteBotAt = new Date(this.options.expiredAt).setDate(new Date(this.options.expiredAt).getDate() +  2)
        this.oneforall = require('oneforall-perso')({
            ...this.options,
            prefix: this.options.prefix || '.',
            token: decrypt(this.options.token),
            __dirname: config.botPersoPath,
            activity: this.options.activity || {activities: [{name: 'oneforall perso .gg/oneforall', type: 'WATCHING'}]}
        })


    }

    restart() {
        this.oneforall.destroy()
        this.oneforall = require('oneforall-perso')({
            ...this.options,
            prefix: this.options.prefix || '.',
            token: decrypt(this.options.token),
            __dirname: config.botPersoPath,
            activity: this.options.activity || {activities: [{name: 'oneforall perso .gg/oneforall', type: 'WATCHING'}]}
        })

    }

    delete() {
        this.clients.database.models.clients.destroy({
            where: {
                discordId: this.options.discordId,
                botId: this.options.botId
            }
        }).then(() => {
            this.oneforall.destroy()
            this.clients.delete(`${this.options.discordId}-${this.options.botId}`)
        }).catch(() => {
        })
        return this;
    }

    get isExpired() {
        if(this.deleteBotAt <= Date.now()) {
            this.oneforall.users.fetch(this.options.discordId).then((owner) => {
                owner.send({content: "Votre bot est arriver à expiration n'oublier pas de renouveller sur https://discord.gg/ckYZguSdrK"}).catch(() => {})
            })
            return true
        }
        else if(this.options.expiredAt <= Date.now()){
            this.oneforall.users.fetch(this.options.discordId).then((owner) => {
                owner.send({content: "Votre bot est sur le point d'arriver à expiration n'oublier pas de renouveller sur https://discord.gg/ckYZguSdrK"}).catch(() => {})
            })

        }
        return false
    }

    async save() {
        for (const property in this.options) this[property] = this.options[property]
        this.clients.database.updateOrCreate(this.clients.database.models.clients, {discordId: this.key.split('-')[0], botId: this.key.split('-')[1] }, this.options).then(() => {
        }).catch((e) => console.error(e));
        return this;
    }


}

module.exports = Clients
