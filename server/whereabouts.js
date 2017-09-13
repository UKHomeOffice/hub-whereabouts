const db = require('./mongo_config')
const mongoose = require('mongoose')
// const teamMembers = require('./team_member')
const Whereabouts = new db.Schema({
  member: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'team_member'
  },
  location: {type: String, default: 'unknown'},
  date: Date
})

module.exports = Whereabouts
