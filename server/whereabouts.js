const db = require('./mongo_config')
const mongoose = require('mongoose')
const WhereAboutsSchema = new db.Schema({
  member: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'team_member'
  },
  location: {type: String, default: 'unknown'},
  date: {
    type: Date,
    required: true
  }
})

module.exports = db.model('where_abouts', WhereAboutsSchema)
