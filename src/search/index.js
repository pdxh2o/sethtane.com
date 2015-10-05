module.exports = SearchView

var hg = require('hyperglue2')
var template = require('./index.html')
var NavView = require('../nav')
var db = require('../db')
var slug = require('../slug')

function SearchView () {
  this.el = hg(template)
}

SearchView.prototype.show = function (r) {
  var query = r.location.query.q
  if (!query || query.length < 3) {
    this.lastQuery = null
    return this.render()
  } else if (query === this.lastQuery) {
    return
  } else {
    this.lastQuery = query
    query = tokenizeQuery(query)
  }

  NavView.sharedInstance.search.focus()

  var toSearch = [].concat(
    Object.keys(db.index.pages),
    Object.keys(db.index.works),
    Object.keys(db.index.news)
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
    return results[id]
  }).sort(function (a, b) {
    var _a = a.item.attachmentUrl ? 1 : 0
    var _b = b.item.attachmentUrl ? 1 : 0
    _a += a.matches.length
    _b += b.matches.length
    return _b - _a
  })

  results = results.map(function (result) {
    var match = result.matches[0]
    var preview = getPreviewParts(match.index, match[0].length, match.input)
    var count = result.matches.length
    var url = result.item.attachmentUrl ? process.env.CDN_URL + result.item.attachmentUrl : null
    if (url) {
      url = process.env.RESIZE_URL + 'resize_h=120&url=' + url
    }
    return {
      'a': {
        _attr: {
          href: urlForItem(result.item)
        }
      },
      '#title': result.item.title || result.item.name || '_',
      '#preview': {
        _html: preview[0] + '<span class="match">' + match[0] + '</span>' + preview[1]
      },
      '#count': count === 1 ? null : '+' + (count - 1) + ' other match' + (count > 2 ? 'es' : ''),
      '#image-preview': url ? {
        _attr: {
          style: 'background-image: url("' + url + '");'
        }
      } : null,
      '#text-preview': result.item.attachmentUrl ? null : ''
    }
  })

  this.render(results)

  document.title = 'Search | Seth Tane'
}

SearchView.prototype.render = function (results) {
  hg(this.el, {
    '.result': results && results.length ? results : [{
      '#title': 'No results found',
      '#preview': null,
      '#count': null,
      '#image-preview': null,
      '#text-preview': null
    }]
  })
}

SearchView.prototype.match = function (item, query) {
  var self = this
  var matches = []
  for (var field in item) {
    if (field === 'id' || field === 'type' || field === 'attachmentUrl') continue
    if (item.type === 'works' && field === 'title') continue
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
      for (var i in query) {
        var regex = query[i]
        var m = null
        var str = field.toString()
        while ((m = regex.exec(str)) !== null) {
          matches.push(m)
        }
      }
    }
  }
  return matches
}

function tokenizeQuery (query) {
  query = query.trim()
  var terms = query.trim().split(' ')
  terms.unshift(query)
  return terms.filter(function (term) {
    return !!term &&
      term !== 'and' &&
      term !== 'is' &&
      term !== 'are' &&
      term !== 'the' &&
      term !== 'this' &&
      term !== 'then' &&
      term !== 'there'
  }).map(function (term) {
    return new RegExp('\\b' + escapeRegExp(term) + '\\b', 'ig')
  })
}

function getPreviewParts (index, length, input) {
  var parts = []
  var bound = 20
  var start = index - bound
  if (start < 0) {
    parts[0] = input.slice(0, index)
  } else {
    while (start >= 0 &&
           input[start] !== ' ' &&
           input[start] !== '\t' &&
           input[start] !== '\n') {
      start--
    }
    parts[0] = '... ' + input.slice(start + 1, index)
  }
  var end = index + length + bound
  if (end > input.length) {
    parts[1] = input.slice(index + length)
  } else {
    while (end <= input.length &&
           input[end] !== ' ' &&
           input[end] !== '\t' &&
           input[end] !== '\n') {
      end++
    }
    parts[1] = input.slice(index + length, end) + ' ...'
  }
  return parts
}

function urlForItem (item) {
  if (item.type === 'pages') {
    return item.url
  } else if (item.type === 'works') {
    return '/work/' + slug.generate(item.title)
  } else if (item.type === 'news') {
    return '/news/' + slug.generate(item.title)
  }
}

function escapeRegExp (s) {
  return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}
