module.exports = request

var http = require('http')
var https = require('https')
var mkurl = require('url').parse

function request (url, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  opts = opts || {}

  var url = mkurl(url)
  url.pathname = url.pathname || ''
  url.search = url.search || ''
  url.hash = url.hash || ''
  url.port = url.port || ''

  var httpOpts = {
    protocol: url.protocol,
    hostname:  url.hostname,
    path: url.pathname + url.search + url.hash,
    port: url.port
  }

  for (var i in opts) {
    httpOpts[i] = opts[i]
  }

  var iface = /https/.test(url.protocol) ? https : http
  var req = iface.request(httpOpts, function (res) {
    if (cb) {
      var string = ''
      res.on('data', function (chunk) {
        string += chunk
      })

      res.on('end', function () {
        cbwrapper(null, res, string)
      })
    }
  })

  if (cb) {
    req.on('error', cbwrapper)
  }

  if (opts.body) {
    req.end(opts.body)
  }

  return req

  function cbwrapper (err, res, data) {
    if (cb._called) return
    cb._called = true
    cb(err, res, data)
  }
}
