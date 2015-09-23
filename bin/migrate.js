var fs = require('fs')
var request = require('../src/request')
var queue = require('queue')

var baseURL = 'https://api.contentful.com/spaces/' + process.env.CMS_SPACE
var token = process.env.CMS_OAUTH_TOKEN

// downloadPaintings()
// downloadImages()
uploadPaintings()

function downloadPaintings () {
  var paintings = []
  var decades = [
    '1970',
    '1980',
    '1990',
    '2000',
    '2010'
  ]
  var n = decades.length
  decades.forEach(function (decade) {
    request(process.env.CDN_URL + '/work/' + decade + '.php', function (err, res, data) {
      data = data.split('workItem').slice(1)
      paintings = paintings.concat(data.map(function (string) {
        return {
          title: string.match(/workTitle">([^<]*)</)[1].trim(),
          date: string.match(/workDate">([^<]*)</)[1].trim(),
          dimension: string.match(/workSize">([^<]*)</)[1].trim(),
          medium: string.match(/workMedium">([^<]*)</)[1].trim(),
          image: string.match('thumbnail" src="([^"]*)"')[1].replace('T.', '.').trim()
        }
      }))
      if (!--n) {
        paintings.sort(function (a, b) { return new Date(a.date) - new Date(b.date) })
        fs.writeFileSync(__dirname + '/../share/images/paintings.json', JSON.stringify(paintings, null, 2))
      }
    }).end()
  })
}

function downloadImages () {
  var paintings = require('../share/images/paintings.json')
  paintings.forEach(function (painting) {
    request(process.env.CDN_URL + painting.image)
      .on('response', function (res) {
        res.pipe(fs.createWriteStream(__dirname + '/../share/images' + painting.image))
      })
      .end()
  })
}

function uploadPaintings () {
  var paintings = require('../share/images/paintings.json')
  var q = queue({ concurrency: 2 })
  paintings.slice(93).forEach(function (painting) {
    q.push(createEntry.bind(null, painting))
  })
  q.start()
}

function createEntry (painting, cb) {
  request(baseURL + '/entries', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'X-Contentful-Content-Type': '6JD89DhMtiMsECcy2eMmAU'
    },
    body: JSON.stringify({
      fields: {
        title: { 'en-US': painting.title },
        date: { 'en-US': painting.date },
        medium: { 'en-US': painting.medium },
        dimensions: { 'en-US': painting.dimension },
        'imageUrLs': {
          'en-US': [
            painting.image
          ]
        }
      }
    })
  }, function (err, res, data) {
    data = JSON.parse(data)
    console.log('-- create entry --')
    console.log(JSON.stringify(data, null, 2))
    publishEntry(data.sys, cb)
  })
}

function publishEntry (entry, cb) {
  request(baseURL + '/entries/' + entry.id + '/published', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'X-Contentful-Version': entry.version
    }
  }, function (err, res, data) {
    console.log('-- publish entry --', data)
    cb()
  }).end()
}
