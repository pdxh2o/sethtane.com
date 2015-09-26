var fs = require('fs')
var request = require('../src/request')
var queue = require('queue')

var baseURL = 'https://api.contentful.com/spaces/' + process.env.CMS_SPACE
var token = process.env.CMS_OAUTH_TOKEN
var args = process.argv.slice(2)

// content_type "Work": 6JD89DhMtiMsECcy2eMmAU
// 'Content-Type': 'application/vnd.contentful.management.v1+json',

getEntries()

function getEntries () {
  request(baseURL + '/entries?content_type=' + args[0], {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }, function (err, res, data) {
    data = JSON.parse(data)
    console.log('-- get entries --')
    // console.log(JSON.stringify(data, null, 2))
    putEntries(migrate(data.items))
  }).end()
}

function migrate (items) {
  return items.map(function (item) {
    item.fields.url = { 'en-US': item.fields.attachmentUrl['en-US'][0] }
    delete item.fields.attachmentUrl
    return item
  })
}

function putEntries (entries) {
  var q = queue({ concurrency: 1 })
  entries.forEach(function (entry) {
    q.push(putEntry.bind(null, entry))
  })
  q.start()
}

function putEntry (entry, cb) {
  console.log(entry.fields)
  request(baseURL + '/entries/' + entry.sys.id, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'X-Contentful-Version': entry.sys.version
    },
    body: JSON.stringify({
      fields: entry.fields
    })
  }, function (err, res, data) {
    data = JSON.parse(data)
    console.log('-- update entry --')
    console.log(JSON.stringify(data, null, 2))
    publishEntry(data, cb)
    cb()
  })
}

function publishEntry (entry, cb) {
  request(baseURL + '/entries/' + entry.sys.id + '/published', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'X-Contentful-Version': entry.sys.version
    }
  }, function (err, res, data) {
    console.log('-- published entry --', data)
    setTimeout(cb, 250)
  }).end()
}
