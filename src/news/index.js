module.exports = NewsView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var md = require('marked').setOptions({ breaks: true })
var lazy = require('../lazy-load')

function NewsView () {
  this.el = hg(template)
}

NewsView.prototype.show = function (r) {
  var parts = window.location.pathname.split('/')
  var articles = []

  if (parts.length >= 3) {
    articles = [ db.data[parts[2]] ]
  } else {
    articles = Object.keys(db.index.news).map(function (id) {
      return db.data[id]
    }).sort(function (a, b) {
      return new Date(b.date) - new Date(a.date)
    })
  }

  articles = articles.map(function (article) {
    var contents = article.contents.map(function (block) {
      if (block.type === 'works') {
        return {
          '#image': block.attachmentUrl ? {
            'a': {
              _attr: {
                href: '/work/' + block.id
              }
            },
            'img': {
              _attr: {
                'lazy-src': process.env.CDN_URL + block.attachmentUrl
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
                'lazy-src': process.env.CDN_URL + block.attachmentUrl
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
      '#permalink': {
        _attr: {
          'href': '/news/' + article.id
        }
      },
      '#title': article.title || article.name || null,
      '#date': (new Date(article.date)).toLocaleDateString(),
      'section': contents
    }
  })

  hg(this.el, {
    'article': articles
  })

  lazy.scan()

  document.body.scrollTop = 0
}
