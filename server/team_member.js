const db = require('./mongo_config')

const TeamMemberSchema = new db.Schema({
  member: String
})

const model = db.model('team_members', TeamMemberSchema)

module.exports = model
