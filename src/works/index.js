module.exports = WorksView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')

function WorksView () {
  this.el = hg(template)
  this._onscroll = this._onscroll.bind(this)
  document.addEventListener('scroll', this._onscroll)
}

WorksView.prototype.show = function (r) {
  var filter = r.location.query.theme || ''
  var themes = db.data['yqjJs1SH60YQUs6g4sQ4E'].items.map(function (theme, i) {
    return {
      'a': {
        _text: theme.title,
        _attr: {
          href: i === 0 ? '?' : '?theme=' + theme.title
        },
        _class: {
          'hover': filter ? filter === theme.title : i === 0
        }
      }
    }
  })

  var works = Object.keys(db.index['works']).map(function (id) {
    return db.index['works'][id]
  }).sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  }).map(function (work) {
    var themes = work.themes ? work.themes.map(function (c) { return c.title }).join(',') : ''
    return {
      _class: {
        'hidden': filter && !themes.match(filter)
      },
      'a': {
        _attr: {
          href: '/work/' + work.id
        }
      },
      'img': {
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

  var single = null
  var pathname = window.location.pathname
  var parts = pathname.split('/')
  if (parts.length >= 3) {
    single = this._single = db.data[parts[2]]
  } else {
    delete this._single
    if (this._lastScroll) {
      setTimeout(function () {
        document.body.scrollTop = this._lastScroll
      }.bind(this))
    }
  }

  hg(this.el, {
    _class: {
      'active': filter
    },
    '.theme': themes,
    '.work': works,
    '#menu': {
      _class: {
        hidden: single
      }
    },
    '#index': {
      _class: {
        hidden: single
      }
    },
    '#single': {
      _class: {
        hidden: !single
      },
      'img': {
        _attr: {
          src: single ? process.env.CDN_URL + single.attachmentUrl : null
        }
      },
      '#title': single && single.title,
      '#date': single && new Date(single.date).getFullYear(),
      '#medium': single && single.medium,
      '#dimensions': single && single.dimensions
    }
  })
}

WorksView.prototype._onscroll = function (evt) {
  if (!this._single) {
    this._lastScroll = document.body.scrollTop
  }
}

WorksView.prototype.hide = function () {
  document.removeEventListener('scroll', this._onscroll)
}