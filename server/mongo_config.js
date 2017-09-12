const db = require("mongoose")

db.Promise = global.Promise

db.connect('mongodb://localhost/hub_whereabouts')

module.exports = db