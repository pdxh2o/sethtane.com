module.exports = NavView

var hg = require('hyperglue2')
var template = require('./index.html')
var router = require('uri-router')
var match = require('uri-router/lib/firstmatch')
var db = require('../db')

NavView.reuse = true

function NavView () {
  this.el = hg(template)
  this.search = this.el.querySelector('input')
  this.search.addEventListener('keyup', this._onkeydown.bind(this))
  NavView.sharedInstance = this
}

NavView.prototype.show = function (r) {
  this.search.value = r.location.query.q || ''

  var pathname = window.location.pathname
  if (pathname === this._lastPathname) {
    return
  } else {
    this._lastPathname = pathname
  }

  var currentPage = { url: '' }
  db.data['2G5d3iYyHe2QyGyeeEwC8c'].items.forEach(function (page) {
    if (page.url.length > currentPage.url.length &&
        new RegExp('^' + page.url).test(pathname)) {
      currentPage = page
    }
  })

  var pages = db.data['2G5d3iYyHe2QyGyeeEwC8c'].items.map(function (page) {
    return {
      a: {
        _attr: { href: page.url },
        _class: { hover: page === currentPage },
        _text: page.title
      }
    }
  })

  hg(this.el, {
    '.item': pages
  })
}

NavView.prototype._onkeydown = function (evt) {
  if (window.location.pathname.indexOf('/search') === -1) {
    router.push('/search?q=' + evt.target.value)
  } else {
    router.search({ q: evt.target.value }, true)
  }
}
