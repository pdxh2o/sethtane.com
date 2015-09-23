module.exports = HomeView

var hg = require('hyperglue2')
var template = require('./index.html')
var db = require('../db')

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
          src: process.env.CDN_URL + theme.attachmentUrl
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
}
