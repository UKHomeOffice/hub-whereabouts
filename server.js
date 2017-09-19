const express = require('express')
const serveStatic = require('serve-static')
const app = express()
const path = require('path')
const _ = require('underscore')
const bodyParser = require('body-parser')
const moment = require('moment')

const startOfWorkingDay = dateStr => {
  let d = moment(dateStr)
  if (!d.isValid()) {
    return null
  }

  return d.startOf('day').add(8, 'hours')
}

app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

app.use(serveStatic('dist/', { 'index': ['index.html'] }))
require('./server/mongo_config')
const teamMembers = require('./server/team_member')
const whereAbouts = require('./server/whereabouts')

// const teamMember = new teamMembers(require("./team_member.json"))
// teamMember.save()
// app.get('/team_members', function (req, res) {
//   teamMembers.find({})
//     .limit(3)
//     .then(data => res.send(data))
// })

// app.post('/team_members', function (req, res) {
//   console.log('team_members', req.body)

//   teamMembers.create({member: 'stu2', whereabouts: [{location: 'S', date: new Date()}]})
// })

// get all members
app.get('/member', (req, res) => {
  teamMembers.find({}).then(data => res.send(data))
})

// get the wehereabouts of the members
app.get('/member/whereabouts', (req, res) => {
  var members
  // get all the members
  teamMembers.find({}).then(data => {
    members = data
    // get all the whereabouts
    return whereAbouts.find({})
  }).then(data => {
    // group whereAbouts by member
    let groupedMembers = _.groupBy(data, where => where.member)
    let result = _.map(members, mem => {
      // link the whereabouts with the relevant member
      mem = mem.toObject()
      mem.whereabouts = groupedMembers[mem._id] || []
      return mem
    })
    res.send(result)
  })
})

// create a new member
app.post('/member', (req, res) => {
  var n = req.body.name.trim()
  if (!n) return res.send('400')
  teamMembers.create({name: n}).then(result => {
    res.send(result)
  }).catch(error => res.send(error))
})

// update/add whereabouts for a specific member
app.post('/member/whereabouts', (req, res) => {
  var d = startOfWorkingDay(req.body.date)
  whereAbouts.findOneAndUpdate({member: req.body.member, date: d}, {location: req.body.where}, {upsert: true})
    .then(result => res.send(result))
    .catch(error => res.send(error))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(process.env.PORT || 3333, () => {
  console.log('The server is running')
})
