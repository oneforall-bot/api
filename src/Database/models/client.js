
module.exports =  (database) => {
    const modelName = 'clients'
    const DataTypes = database.DataTypes
    try {
        database.define(modelName, {
            id: {
              type: DataTypes.INTEGER,
              autoIncrement: true,
              primaryKey: true
            },
            discordId: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            licenseKey: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false
            },
            botId: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            expiredAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                default: new Date()
            },
            guildIds: {
                type: DataTypes.JSON(),
                allowNull: true,
            },
            owners: {
                type: DataTypes.JSON(),
                allowNull: true,
            },
            maxGuilds: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5
            }
        }, {
            tableName: modelName,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        })
        database.models[modelName].sync()
        return database.models[modelName]
    } catch (e) {
        console.log(e)
    }
}
