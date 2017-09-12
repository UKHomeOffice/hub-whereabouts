const express = require('express')
const serveStatic = require('serve-static')
const app = express()
const path = require('path')
const _ = require('underscore')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

app.use(serveStatic('dist/', { 'index': ['index.html'] }))
require('./server/mongo_config')
const teamMembers = require('./server/team_member')
// const teamMember = new teamMembers(require("./team_member.json"))
// teamMember.save()
app.get('/team_members', function (req, res) {
  teamMembers.find({})
    .limit(3)
    .then(data => res.send(data))
})

app.post('/team_members', function (req, res) {
  console.log('team_members', req.body)

  teamMembers.create({member: 'stu2', whereabouts: [{location: 'S', date: new Date()}]})
})

app.put('/team_members', function (req, res) {
  console.log('team_members', req.body)
  teamMembers.findOneAndUpdate({_id: ObjectId(req.body.member)}, {$set: {date: date }})
})

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(process.env.PORT || 3333, function () {
  console.log('The server is running')
})
