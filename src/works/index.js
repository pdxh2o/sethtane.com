module.exports = WorksView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var lazy = require('../lazy-load')
var slug = require('../slug')
var router = require('uri-router')

var sizes = {
  '1': 200,
  '2': 300,
  '3': 400,
  '4': 500,
  '6': 600
}

function WorksView () {
  this.el = hg(template)
  this._onclick = this._onclick.bind(this)
  document.addEventListener('click', this._onclick)
}

WorksView.prototype.show = function (r) {
  var single = slug.match(window.location.pathname.split('/')[2])
  var filter = r.location.query.theme || ''
  var selectedTheme = false
  var themes = db.data['yqjJs1SH60YQUs6g4sQ4E'].items.map(function (theme, i) {
    if (filter === theme.title) selectedTheme = theme
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

  if (filter && !selectedTheme) {
    return router.redirect('/work')
  }

  var works = Object.keys(db.index['works']).map(function (id) {
    return db.data[id]
  }).filter(function (work) {
    if (single) return single.test(work.title)
    return true
  }).sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  }).map(function (work) {
    var themes = work.themes ? work.themes.map(function (c) { return c.title }).join(',') : ''
    var size = String(work.size || '1')
    var url = work.attachmentUrl ? process.env.CDN_URL + work.attachmentUrl : null
    if (url) {
      url = process.env.RESIZE_URL + url + '?q=' + process.env.IMAGE_QUALITY
      if (single) {
        url += '&fit=fill&w=1600&h=1600'
      } else {
        url += '&fit=fill&w=' + sizes[size] + '&h=' + sizes[size]
      }
    }
    return {
      _class: {
        'hidden': !single && filter && !themes.match(filter)
      },
      'a': {
        _attr: {
          href: single ? null : '/work/' + slug.generate(work.title)
        }
      },
      'img': {
        _attr: {
          'data-id': work.id,
          'lazy-src': url
        },
        _class: {
          '_1': size === '1',
          '_2': size === '2',
          '_3': size === '3',
          '_4': size === '4',
          '_5': size === '5'
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
      'active': filter,
      'single': single
    },
    '.theme': themes,
    '.work': works.length ? works : [{ _html: '<h1>404</h1>' }],
    '#menu': {
      _class: {
        hidden: single
      }
    }
  })

  lazy.scan()

  if (!single && this._clicked) {
    var img = this.el.querySelector('[data-id="' + this._clicked + '"]')
    document.body.scrollTop = (img.y || img.clientY) - (document.body.clientHeight / 3)
  } else {
    document.body.scrollTop = 0
  }

  var title = 'Work | ' + db.settings.baseTitle
  var description = null
  if (works.length === 0) {
    title = 'Not Found | ' + title
    description = ''
  } else if (works.length === 1) {
    var work = works[0]
    title = work['#title'] + ' | ' + title
    description = work['#medium'] + ' ' + work['#date'] + ' ' + work['#dimensions']
    description = description[0].toUpperCase() + description.slice(1)
  } else if (filter) {
    title = filter + ' | ' + title
    description = selectedTheme.description
  }
  document.title = title
  if (description !== null) {
    document.querySelector('[name=description]').setAttribute('content', description)
  }
}

WorksView.prototype._onclick = function (evt) {
  if (!this.el.classList.contains('single')) {
    this._clicked = evt.target.getAttribute('data-id')
  }
}

WorksView.prototype.hide = function () {
  this.el.removeEventListener('click', this._onclick)
}
