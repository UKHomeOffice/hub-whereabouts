const db = require("./mongo_config")
const Whereabouts = require("./whereabouts")
const TeamMemberSchema = new db.Schema({
        member: String,
        whereabouts: [Whereabouts]

        })

const model = db.model('team_members', TeamMemberSchema)

module.exports = model

