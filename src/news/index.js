module.exports = NewsView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var md = require('marked').setOptions({ breaks: true })
var lazy = require('../lazy-load')
var slug = require('../slug')

function NewsView () {
  this.el = hg(template)
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
          'href': '/news/' + slug.generate(article.title)
        }
      },
      '#title': article.title,
      '#date': (new Date(article.date)).toLocaleDateString(),
      'section': contents
    }
  })

  hg(this.el, {
    'article': articles.length ? articles : [{ _html: '<h1>404</h1>' }]
  })

  lazy.scan()

  document.body.scrollTop = 0
}
