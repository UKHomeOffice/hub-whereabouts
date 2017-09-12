const db = require('./mongo_config')

const Whereabouts = new db.Schema({
  location: {type: String, default: 'unknown'},
  date: Date
})

module.exports = Whereabouts
