module.exports = NewsView

var hg = require('hyperglue2')
var template = require('./index.html')
var shareTemplate = require('./share.html')
var db = require('../db')
var md = require('marked').setOptions({ breaks: true })
var lazy = require('../lazy-load')
var slug = require('../slug')

function NewsView () {
  this.el = hg(template)
  this._onclick = this._onclick.bind(this)
  this.el.addEventListener('click', this._onclick)
}

NewsView.prototype.show = function (r) {
  var single = slug.match(window.location.pathname.split('/')[2])
  var articles = Object.keys(db.index.news).map(function (id) {
    return db.data[id]
  }).filter(function (article) {
    if (single) return single.test(article.title)
    return true
  }).sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  }).map(function (article) {
    var contents = article.contents.map(function (block) {
      if (block.type === 'works') {
        return {
          '#image': block.attachmentUrl ? {
            'a': {
              _attr: {
                href: '/work/' + slug.generate(block.title)
              }
            },
            'img': {
              _attr: {
                'lazy-src': process.env.RESIZE_URL + '?container=focus&resize_w=1600&url=' + process.env.CDN_URL + block.attachmentUrl
              }
            }
          } : null,
          '#work-meta #title': block.title,
          '#work-meta #date': new Date(block.date).getFullYear(),
          '#work-meta #dimensions': block.dimensions,
          '#work-meta #medium': block.medium,
          '#caption': null,
          '#text': null
        }
      } else if (block.type === 'images') {
        return {
          '#image': block.attachmentUrl ? {
            'img': {
              _attr: {
                'lazy-src': process.env.RESIZE_URL + '?container=focus&resize_w=1600&url=' + process.env.CDN_URL + block.attachmentUrl
              }
            }
          } : null,
          '#work-meta': null,
          '#caption': block.caption ? {
            _html: md(block.caption)
          } : null,
          '#text': null
        }
      } else if (block.type === 'text-blocks') {
        return {
          '#image': null,
          '#work-meta': null,
          '#caption': null,
          '#text': block.text ? {
            _html: md(block.text)
          } : null
        }
      }
    })

    return {
      '#title': {
        _text: article.title,
        _attr: {
          href: '/news/' + slug.generate(article.title)
        }
      },
      '#date': (new Date(article.date)).toLocaleDateString(),
      '#share-button': {
        _attr: {
          'data-title': article.title,
          'data-url': '/news/' + slug.generate(article.title)
        }
      },
      'section': contents
    }
  })

  hg(this.el, {
    'article': articles.length ? articles : [{ _html: '<h1>404</h1>' }]
  })

  lazy.scan()

  document.body.scrollTop = 0

  var title = 'News | Seth Tane'
  if (articles.length === 0) title = 'Not Found | ' + title
  else if (articles.length === 1) title = articles[0]['#title']._text + ' | ' + title
  document.title = title
}

NewsView.prototype._onclick = function (evt) {
  var target = evt.target
  if (target.id === 'share-button') {
    var title = target.getAttribute('data-title')
    var url = window.location.origin + target.getAttribute('data-url')
    var el = hg(shareTemplate, {
      '#title': title,
      'a': {
        _text: url,
        _attr: {
          href: url
        }
      }
    })
    el.addEventListener('click', function (evt) {
      var id = evt.target.id
      if (/close|share/.test(id)) {
        el.parentNode.removeChild(el)
      }
    })
    var app = document.querySelector('#app')
    app.appendChild(el)
  }
}
