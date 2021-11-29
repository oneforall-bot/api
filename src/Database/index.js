const {Sequelize, DataTypes} = require('sequelize'),
    {name, password, username} = require('../config').database,
    fs = require('fs'),
    Clients = require('../Clients')


class Database extends Sequelize {
    constructor(app) {
        super(name, username, password, {
            dialect: 'mysql',
            logging: false
        });
        this.DataTypes = DataTypes;
        this.authenticate()
        this.loadModels().then(() => {
            console.log('database init')
            app.set('clients', new Clients(this))
        })
    }

    authenticate(options) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Database is logged in')
                super.authenticate(options).then(resolve).catch(reject);
            } catch (err) {
                reject(err);
            }
        })
    }

    loadModels() {
        return new Promise((resolve, reject) => {
            fs.readdir('src/Database/models', (err, files) => {
                if (err) return
                files.forEach(async file => {
                    require(`./models/${file}`)(this)
                })
                resolve()
            })
        })

    }

    updateOrCreate(model, where, newItem) {
        return new Promise((resolve, reject) => {
            model.findOne({where}).then(foundItem => {
                if (!foundItem)
                    model.create(newItem).then(item => resolve({item, created: true})).catch(e => reject(e))
                else
                    model.update(newItem, {where}).then(item => resolve({item, created: false})).catch(e => reject(e))
            }).catch(e => reject(e))
        })
    }

}

module.exports = Database
