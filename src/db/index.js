module.exports = new DB()

var request = require('../request')

var url = 'https://cdn.contentful.com/spaces/' + process.env.CMS_SPACE + '/entries?limit=1000&access_token=' + process.env.CMS_KEY
// var url = window.location.origin + '/build.json'

var types = {
  '59ta0rmIx2qGQ8u2caiIQw': 'images',
  'NAu5BlmiGaGuQYgg8SoKM': 'menus',
  'Io8ByyN902UeioGiK6I04': 'news',
  '4SRWIhm9skYmEOoOeEK8wA': 'pages',
  '2PYl9UW2tOwOEwAwGkUsgs': 'settings',
  '5Cu1Q9TVD2uqcQ8ugyGIs6': 'slideshows',
  '7oqJluKUViIgs4ukS2w48I': 'text-blocks',
  '39AMe6BdluY2cmE8wccCYc': 'themes',
  '6JD89DhMtiMsECcy2eMmAU': 'works',
}

function DB () {}

DB.prototype.fetch = function (cb) {
  request(url, function (err, res, body) {
    if (err) return cb(err)

    try {
      var items = JSON.parse(body).items
    } catch (err) {
      return cb(err)
    }

    var data = this.data = {}
    var index = this.index = {}

    items.forEach(function (item) {
      var type = types[item.sys.contentType.sys.id] || item.sys.contentType.sys.id
      var fields = item.fields
      fields.id = item.sys.id
      fields.type = type
      data[item.sys.id] = fields
      index[type] = index[type] || {}
      index[type][item.sys.id] = fields
    })

    for (var item in data) {
      item = data[item]
      for (var field in item) {
        var value = item[field]
        if (Array.isArray(value)) {
          var resolved = []
          for (var i = 0; i < value.length; i++) {
            var subvalue = value[i]
            if (subvalue.sys) {
              subvalue = data[subvalue.sys.id]
              if (subvalue) {
                resolved.push(subvalue)
              }
            } else {
              resolved.push(subvalue)
            }
          }
          item[field] = resolved
        }
      }
    }

    cb()
  }.bind(this)).end()
}

Object.defineProperty(DB.prototype, 'settings', {
  get: function () {
    return this.data['DdJRngcVXisIG0giQm0Ky']
  }
})
