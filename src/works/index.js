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
  var single = window.location.pathname.split('/')[2]
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
  }).filter(function (work) {
    if (single) return work.id === single
    return true
  }).sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  }).map(function (work) {
    var themes = work.themes ? work.themes.map(function (c) { return c.title }).join(',') : ''
    var imageUrl = null
    if (work.attachmentUrl) {
      imageUrl = process.env.CDN_URL + (single ? work.attachmentUrl : work.attachmentUrl.replace('.j', 'T.j'))
    }
    return {
      _class: {
        'hidden': !single && filter && !themes.match(filter)
      },
      'a': {
        _attr: {
          href: single ? '/work' : '/work/' + work.id
        }
      },
      'img': {
        _attr: {
          src: imageUrl
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
        single: single
      }
    }
  })

  if (single) {
    this._single = true
    document.body.scrollTop = 0
  } else if (this._lastScroll) {
    delete this._single
    document.body.scrollTop = this._lastScroll
  }
}

WorksView.prototype._onscroll = function (evt) {
  if (!this._single) {
    this._lastScroll = document.body.scrollTop
  }
}

WorksView.prototype.hide = function () {
  document.removeEventListener('scroll', this._onscroll)
}
