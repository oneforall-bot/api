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
            this.add(client.get('discordId'), client.get())
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
        options.client = key || options.discordId
        for (const property in options) this[property] = options[property]
        this.key = key

        this.clients = clients
        this.options = options
        this.oneforall = require('oneforall-perso')({
            ...this.options,
            prefix: this.options.prefix || '.',
            token: decrypt(this.options.token),
            __dirname: config.botPersoPath
        })


    }

    restart() {

        this.oneforall = require('oneforall-perso')({
            ...this.options,
            prefix: this.options.prefix || '.',
            token: decrypt(this.options.token),
            __dirname: config.botPersoPath
        })

    }

    delete() {
        this.clients.database.models.clients.destroy({
            where: {
                discordId: this.options.discordId
            }
        }).then(() => {
            this.oneforall.destroy()
            this.clients.delete(this.options.discordId)
        }).catch(() => {
        })
        return this;
    }

    get isExpired() {
        return moment().isAfter(moment(this.options.expiredAt).add(2, "days"))
    }

    async save() {
        for (const property in this.options) this[property] = this.options[property]
        this.clients.database.updateOrCreate(this.clients.database.models.clients, {discordId: this.key}, this.options).then(() => {
        }).catch((e) => console.error(e));
        return this;
    }


}

module.exports = Clients
