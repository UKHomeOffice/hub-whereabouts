const db = require('./mongo_config')

const TeamMemberSchema = new db.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
})

const model = db.model('team_members', TeamMemberSchema)

module.exports = model
