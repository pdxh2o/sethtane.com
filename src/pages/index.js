module.exports = PageView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var md = require('marked').setOptions({ breaks: true })
var SlideshowView = require('../slideshow')

var templates = {
  home: require('../home'),
  works: require('../works'),
  news: require('../news')
}

PageView.reuse = true

PageView.findByURL = function (url) {
  var best = { title: 'Not Found', url: '' }
  var pages = db.index.pages
  for (var i in pages) {
    var page = db.index.pages[i]
    if (page.url.length > best.url.length &&
        (page.url === '/' && url === '/' ||
         page.url !== '/' && new RegExp('^' + page.url + '(\\b|$)').test(url))) {
      best = page
    }
  }
  return best
}

function PageView () {
  this.el = hg(template)
  this.slideshows = []
  this._onmutation = this._onmutation.bind(this)
  this.observer = new MutationObserver(this._onmutation)
  this.observer.observe(this.el, {
    subtree: true,
    childList: true,
    attributes: false
  })
}

PageView.prototype.show = function (r) {
  var page = PageView.findByURL(window.location.pathname)

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
    'section': (page.contents || [ page ]).map(function (block) {
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
      } else if (block.type === 'slideshows') {
        var show = new SlideshowView(block)
        show.start()
        return show
      } else {
        return { _html: block.template ? null : '<h1 style="text-align: center;">404</h1>' }
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
    this.hideTemplate()
    var title = 'Seth Tane'
    if (page.url !== '/') {
      title = page.title + ' | ' + title
    }
    document.title = title
  }
}

PageView.prototype._onmutation = function (mutations) {
  mutations.forEach(function (evt) {
    Array.prototype.slice.call(evt.removedNodes).forEach(function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (node) {
        node.hide && node.hide()
      })
    })
  })
}

PageView.prototype.hideTemplate = function (r) {
  if (this.templateView) {
    this.templateView.hide && this.templateView.hide(r)
    this.templateView.el.parentNode.removeChild(this.templateView.el)
    delete this.templateView
  }
}

PageView.prototype.hide = function (r) {
  this.hideTemplate()
  this.observer.disconnect()
}
