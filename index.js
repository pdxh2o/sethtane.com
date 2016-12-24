var db = require('./src/db')
var router = require('uri-router')

var appendChild = Element.prototype.appendChild
Element.prototype.appendChild = function (child) {
  return appendChild.call(this, child.el || child)
}

var removeChild = Element.prototype.removeChild
Element.prototype.removeChild = function (child) {
  return removeChild.call(this, child.el || child)
}

var insertBefore = Element.prototype.insertBefore
Element.prototype.insertBefore = function (a, b) {
  return insertBefore.call(this, a.el || a, b.el || b)
}

db.fetch(function (err) {
  if (err) throw err

  router({
    watch: 'pathname',
    outlet: document.querySelector('#nav-outlet'),
    routes: [
      ['.*', require('./src/nav')]
    ]
  })

  router({
    watch: 'pathname',
    outlet: document.querySelector('#page-outlet'),
    routes: [
      ['/search', require('./src/search')],
      ['.*', require('./src/pages')]
    ]
  })

  router({
    watch: 'pathname',
    routes: [
      ['.*', function () {
        if (window.ga) {
          window.ga('send', 'pageview', window.location.pathname)
        }
      }]
    ]
  })

  document.querySelector('#app').classList.remove('loading')
  document.querySelector('#footer').classList.remove('hidden')
})
