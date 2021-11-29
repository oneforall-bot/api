const CryptoJS = require('crypto-js'),
    {apiKey} = require('../config')

function encrypt(string) {
    return CryptoJS.AES.encrypt(string, apiKey)

}

function decrypt(encryptedString) {
    return CryptoJS.AES.decrypt(encryptedString, apiKey).toString(CryptoJS.enc.Utf8)

}

function deleteIfExpired(clientsManager) {
    console.log("Start checking for expired clients")
    const hasExpire = clientsManager.filter(client => client.isExpired)
    hasExpire.forEach(client => client.delete())
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))


module.exports = {encrypt, decrypt, deleteIfExpired, sleep}
