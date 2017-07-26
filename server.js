var requirejs = require('requirejs')

requirejs.config({
  paths: {
  }
})

var fs = require('fs')
var google = require('googleapis')
var express = require('express')
var serveStatic = require('serve-static')
var http = require('http')
var https = require('https')
var app = express()
var _ = require('underscore')

var KubeService = require('./src/node/kube-service')

app.use(serveStatic('dist/', { 'index': ['index.html'] }))

var environments = {
  dev: {
    label: 'dev',
    namespace: 'pt-i-dev',
    pods: []
  },
  test: {
    label: 'test',
    namespace: 'pt-i-test',
    pods: []
  },
  preprod: {
    label: 'pre-prod',
    namespace: 'pt-i-preprod',
    pods: []
  }
}

var projects = {
  fs: {
    label: 'Financial Status',
    podprefix: 'pttg-fs',
    availabilityCheck: '/pttg/financialstatus/v1/availability',
    domains: {
      dev: 'pttg-fs-ui-dev.notprod.homeoffice.gov.uk',
      test: 'pttg-fs-ui-test.notprod.homeoffice.gov.uk',
      preprod: 'pttg-fs-ui-preprod.notprod.homeoffice.gov.uk'
    }
  },
  ipgt: {
    label: 'Income Proving: Generic Tool',
    podprefix: 'pttg-ip',
    domains: {
      dev: 'pttg-ip-gt-ui-dev.notprod.homeoffice.gov.uk',
      test: 'pttg-ip-gt-ui-test.notprod.homeoffice.gov.uk',
      preprod: 'pttg-ip-gt-ui-preprod.notprod.homeoffice.gov.uk'
    }
  },
  ipfm: {
    label: 'Income Proving: Family Migration',
    podprefix: 'pttg-ip-fm',
    domains: {
      dev: 'pttg-ip-fm-ui-dev.notprod.homeoffice.gov.uk',
      test: 'pttg-ip-fm-ui-test.notprod.homeoffice.gov.uk',
      preprod: 'pttg-ip-fm-ui-preprod.notprod.homeoffice.gov.uk'
    }
  }
}

// KubeService.getPods('pt-i-dev').then(function (result) {
//   var grouped = KubeService.groupPodsByProject(result.items, projects)

//   _.each(grouped, function (pods, pid) {
//     console.log('Group :' + pid)
//     _.each(pods, function (pod) {
//       console.log(pod.metadata.name)
//     })
//     console.log('')
//   })
// }, function (error) {
//   console.log(error)
// })

app.get('/ga', function (req, res) {
  var key = require('./PTTG-bab5de9fb5ab')
  console.log(key)
  var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'],
    null
  )

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err)
      res.send({error: 'Something went wrong'})
      return
    }
    var gaHtml = fs.readFileSync('./src/ga.html', 'utf-8')
    var output = gaHtml.replace(/{{ ACCESS_TOKEN_FROM_SERVICE_ACCOUNT }}/g, tokens.access_token)

    res.send(output)
  })
})

app.get('/config', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send({ environments: environments, projects: projects })
})

// app.get('/logs/:env/:podName/:containerName', function (req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   var env = environments[req.params.env]
//   KubeService.getLog(env.namespace, req.params.podName, containerName).then(function (results) {
//     res.send(results)
//   }, function (err) {
//     console.log(err)
//   })
//   // kubectl logs  pttg-fs-ui-3386164587-56tr1 -c pttg-fs-ui --namespace=pt-i-dev --since=24h
// })

// get the UI health
app.get('/health/ui/:pid/:env', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var proj = projects[req.params.pid]
  if (!proj) {
    res.statusCode = 400
    res.send({ error: 'Invalid pid' })
    return
  }
  var d
  if (!proj.domains || !_.has(proj.domains, req.params.env)) {
    res.statusCode = 400
    res.send({ error: 'Invalid env' })
    return
  }
  d = proj.domains[req.params.env]

  var result = ''

  var r = https.request({
    host: d,
    path: '/healthz',
    rejectUnauthorized: false
  }, function (response) {
    // read the data response
    response.setEncoding('utf8')
    response.on('data', function (chunk) {
      result += chunk
    })

    response.on('end', function (e) {
      if (result.length === 0) {
        res.status(400)
      }
      res.send(result)
    })
  })
  r.on('error', function (e) {
    console.error('error', e)
  })
  r.end()
})

// get the UI health
app.get('/availability/ui/:pid/:env', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var proj = projects[req.params.pid]
  if (!proj) {
    res.statusCode = 404
    res.send({ error: 'Invalid pid' })
    return
  }
  if (!proj.availabilityCheck) {
    res.statusCode = 404
    res.send({ error: 'Availability check not possible' })
    return
  }
  var d
  if (!proj.domains || !_.has(proj.domains, req.params.env)) {
    res.statusCode = 404
    res.send({ error: 'Invalid env' })
    return
  }
  d = proj.domains[req.params.env]

  var result = ''

  var r = https.request({
    host: d,
    path: proj.availabilityCheck,
    rejectUnauthorized: false
  }, function (response) {
    // read the data response
    response.setEncoding('utf8')
    response.on('data', function (chunk) {
      result += chunk
    })

    response.on('end', function (e) {
      res.status = response.statusCode
      res.send({ ok: response.statusCode === 200 })
    })
  })
  r.on('error', function (e) {
    console.error('error', e)
  })
  r.end()
})

// get the API health - this requires VPN and a Kubectl forwarded port
// kubectl --namespace=pt-i-dev port-forward pttg-fs-api-3477980161-4tt4g 8888:8080 >/dev/null 2>&1 &
app.get('/health/api/:podname/:pid/:env', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  // podname, pid, envref
  var proj = projects[req.params.pid]
  if (!proj) {
    res.statusCode = 404
    res.send({ error: 'Invalid pid' })
    return
  }

  if (!proj.domains || !_.has(proj.domains, req.params.env)) {
    res.statusCode = 404
    res.send({ error: 'Invalid env' })
    return
  }
  var env = environments[req.params.env]

  // kubectl exec pttg-fs-api-3477980161-4tt4g --namespace=pt-i-dev -c=pttg-fs-api -- curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET localhost:8080/healthz
  KubeService.getAPIStatus(req.params.podname, proj.podprefix + '-api', env.namespace).then(function (result) {
    res.send(result)
  }, function (error) {
    res.statusCode = 500
    res.send({error: error})
  })
})

// get the pods - requires VPN
// app.get('/pods/:env', function (req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   var env = environments[req.params.env]
//   if (!env) {
//     res.statusCode = 400
//     res.send({ error: 'Invalid env' })
//     return
//   }

//   KubeService.getPods(env.namespace).then(function (result) {
//     res.send(result)
//   }, function (error) {
//     res.status = 500
//     res.send({error: error})
//   })
// })

app.get('/namespace/:namespace/pod', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  KubeService.getPods(req.params.namespace).then(function (result) {
    res.send(result)
  }, function (error) {
    res.statusCode = 500
    res.send({error: error})
  })
})

app.get('/namespace/:namespace/pod/:pid/container/:container/log', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  KubeService.getLog(req.params.namespace, req.params.pid, req.params.container).then(function (result) {
    res.send(result)
  }, function (error) {
    res.statusCode = 500
    res.send({error: error})
  })
})

app.get('/namespace/:namespace/pod/:pid/container/:container/health', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  KubeService.getHealth(req.params.namespace, req.params.pid, req.params.container).then(function (result) {
    res.send(result)
  }, function (error) {
    res.statusCode = 500
    res.send({error: error})
  })
})

app.listen(process.env.PORT || 9999, function () {
  console.log('The server is running')
})
