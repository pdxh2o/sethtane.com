module.exports = HomeView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')
var lazy = require('../lazy-load')

function HomeView () {
  this.el = hg(template)
}

HomeView.prototype.show = function () {
  var themes = db.data['yqjJs1SH60YQUs6g4sQ4E'].items.map(function (theme, i) {
    return {
      'a': {
        _attr: {
          href: i === 0 ? '/work' : '/work?theme=' + theme.title
        }
      },
      'img': {
        _attr: {
          'lazy-src': process.env.RESIZE_URL +
            theme.attachmentUrl +
            '?q=' + process.env.IMAGE_QUALITY +
            '&fit=crop&w=560&h=420'
        }
      },
      '#title': {
        _text: theme.title
      }
    }
  })

  hg(this.el, {
    '.theme': themes
  })

  lazy.scan()

  document.title = db.settings.baseTitle
}
