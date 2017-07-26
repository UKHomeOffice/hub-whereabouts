const express = require('express')
const serveStatic = require('serve-static')
const app = express()
const path = require('path')

app.use(serveStatic('dist/', { 'index': ['index.html'] }))

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(process.env.PORT || 3333, function () {
  console.log('The server is running')
})
