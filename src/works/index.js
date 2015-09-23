module.exports = WorksView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')

function WorksView () {
  this.el = hg(template)
}

WorksView.prototype.show = function (r) {
  var selection = r.location.query.theme || ''

  var themes = db.data['yqjJs1SH60YQUs6g4sQ4E'].items.map(function (theme, i) {
    return {
      'a': {
        _text: theme.title,
        _attr: {
          href: i === 0 ? '?' : '?theme=' + theme.title
        },
        _class: {
          'hover': selection ? selection === theme.title : i === 0
        }
      }
    }
  })

  var works = Object.keys(db.index['works']).map(function (id) {
    return db.index['works'][id]
  }).sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  })

  works = works.map(function (work) {
    var themes = work.themes ? work.themes.map(function (c) { return c.title }).join(',') : ''
    return {
      _class: {
        'hidden': selection && !themes.match(selection)
      },
      img: {
        _attr: {
          src: work.attachmentUrl ? process.env.CDN_URL + work.attachmentUrl.replace('.j', 'T.j') : null
        },
        _class: {
          '_2': work.size == 2,
          '_3': work.size == 3,
          '_4': work.size == 4,
          '_5': work.size == 5
        }
      },
      '#title': work.title,
      '#date': new Date(work.date).getFullYear(),
      '#medium': work.medium,
      '#dimensions': work.dimensions
    }
  })

  hg(this.el, {
    _class: {
      active: selection
    },
    '.theme': themes,
    '.work': works
  })
}
