module.exports = PageView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var md = require('marked').setOptions({ breaks: true })

var templates = {
  home: require('../home'),
  works: require('../works'),
  news: require('../news')
}

PageView.reuse = true

function PageView () {
  this.el = hg(template)
}

PageView.prototype.show = function (r) {
  var page = this.findByURL(window.location.pathname)

  hg(this.el, {
    '#contents': {
      _class: {
        hidden: page.template
      },
    },
    '#template': {
      _class: {
        hidden: !page.template
      }
    },
    'section': (page.contents || []).map(function (block) {
      if (block.type === 'works') {
        return {
          '#title': null,
          '#image': block.attachmentUrl ? {
            'img': {
              _attr: {
                src: process.env.CDN_URL + block.attachmentUrl
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
          '#title': null,
          '#image': block.attachmentUrl ? {
            'img': {
              _attr: {
                src: process.env.CDN_URL + block.attachmentUrl
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
          '#title': block.title,
          '#image': null,
          '#work-meta': null,
          '#caption': null,
          '#text': block.text ? {
            _html: md(block.text)
          } : null
        }
      } else {
        return {
          '#title': '-- ' + block.type + ' --'
        }
      }
    })
  })

  if (page.template) {
    var TemplateView = templates[page.template.toLowerCase()]
    if (this.templateView) {
      if (this.templateView instanceof TemplateView) {
        this.templateView.show(r)
        return
      } else {
        this.hide()
      }
    }
    this.templateView = new TemplateView()
    hg(this.el, { '#template': this.templateView.el })
    this.templateView.show(r)
  } else {
    this.hide()
  }
}

PageView.prototype.findByURL = function (url) {
  var pages = db.index.pages
  for (var i in pages) {
    var page = db.index.pages[i]
    if (new RegExp('^' + page.url).test(url)) {
      return page
    }
  }
  return {
    title: '404',
    body: 'Not Found'
  }
}

PageView.prototype.hide = function (r) {
  if (this.templateView) {
    this.templateView.hide && this.templateView.hide(r)
    this.templateView.el.parentNode.removeChild(this.templateView.el)
    delete this.templateView
  }
}
