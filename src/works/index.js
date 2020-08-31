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
  '5': 600,
  '6': 700
}

var audioPlayImage = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.0"  width="500" height="500" viewBox="0 0 75 75">
<path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
style="stroke:#111;stroke-width:5;stroke-linejoin:round;fill:#111;"
/>
<path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#111;stroke-width:5;stroke-linecap:round"/>`

var audioStopImage = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="500" height="500" viewBox="0 0 75 75"
stroke="#111" stroke-width="5">
<path d="m39,14-17,15H6V48H22l17,15z" fill="#111" stroke-linejoin="round"/>
<path d="m49,26 20,24m0-24-20,24" fill="none" stroke-linecap="round"/>`

function WorksView () {
  this.el = hg(template)
  this._onclick = this._onclick.bind(this)
  document.addEventListener('click', this._onclick)
}

WorksView.prototype.show = function (uri) {
  var single = slug.match(window.location.pathname.split('/')[2])
  var filter = uri.query.theme || ''
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
    var url = work.attachmentUrl || null
    if (url) {
      url = process.env.RESIZE_URL + url + '?q=' + process.env.IMAGE_QUALITY
      if (single) {
        url += '&fit=max&w=1600&h=1600'
      } else {
        url += '&fit=max&w=' + sizes[size] + '&h=' + sizes[size]
      }
    }
    var title = work.title
    if (work.audioUrl) {
      work.audioUrl.forEach(url => {
        title += `<div class=audio><audio src=${process.env.CDN_URL + url}></audio><button id=play class=hidden>${audioPlayImage}</button><button>${audioStopImage}</button></div>`
      })
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
      '#title': {
        _html: title,
      },
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
  var target = evt.target
  if (target.parentElement.classList.contains('audio')) {
    Array.from(this.el.querySelectorAll('audio')).forEach(el => el.pause())
    if (target.id === 'play') {
      target.classList.add('hidden')
      target.nextElementSibling.classList.remove('hidden')
    } else {
      target.classList.add('hidden')
      target.previousElementSibling.classList.remove('hidden')
      target.parentElement.firstElementChild.play(0)
    }
  } else if (!this.el.classList.contains('single')) {
    this._clicked = evt.target.getAttribute('data-id')
  }
}

WorksView.prototype.hide = function () {
  this.el.removeEventListener('click', this._onclick)
}
