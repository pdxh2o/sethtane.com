module.exports = SearchView

var hg = require('hyperglue2')
var template = require('./index.html')
var NavView = require('../nav')
var db = require('../db')

function SearchView () {
  this.el = hg(template)
}

SearchView.prototype.show = function (r) {
  var query = r.location.query.q
  if (!query || query.length < 3) {
    return this.render()
  } else if (query === this.lastQuery) {
    return
  } else {
    this.lastQuery = query
  }

  NavView.sharedInstance.search.focus()

  var toSearch = [].concat(
    Object.keys(db.index.pages),
    Object.keys(db.index.works),
    Object.keys(db.index.news),
    Object.keys(db.index.images)
  )

  var results = {}
  for (var i = 0; i < toSearch.length; i++) {
    var id = toSearch[i]
    var item = db.data[id]
    var matches = this.match(item, query)
    if (matches.length) {
      results[id] = {
        item: item,
        matches: matches
      }
    }
  }

  results = Object.keys(results).map(function (id) {
    var result = results[id]
    return {
      '#title': result.item.title || result.item.name || '_',
      '#matches': result.matches.join(', ')
    }
  })

  this.render(results)
}

SearchView.prototype.render = function (results) {
  hg(this.el, {
    '.result': results && results.length ? results : [{
      '#title': 'No results found'
    }]
  })
}

SearchView.prototype.match = function (item, query) {
  var self = this
  var regex = new RegExp(escapeRegExp(query), 'ig')
  var matches = []
  for (var field in item) {
    if (field === 'id' || field === 'type') continue
    field = item[field]
    if (Array.isArray(field)) {
      if (typeof field[0] === 'object') {
        field.forEach(function (item) {
          matches = matches.concat(self.match(item, query))
        })
      } else {
        matches = matches.concat(self.match(field, query))
      }
    } else if (field) {
      var fieldMatches = field.toString().match(regex)
      if (fieldMatches) {
        matches.push(fieldMatches)
      }
    }
  }
  return matches
}

function escapeRegExp (s) {
  return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}
