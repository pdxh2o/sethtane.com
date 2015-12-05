module.exports = SlideshowView

var hg = require('hyperglue2')
var template = require('./index.html')

var lastSlide = {}

function SlideshowView (data) {
  var el = hg(template, {
    'li': data.slides.map(function (slide) {
      var isWork = slide.type === 'works'
      return {
        _class: {
          'lazy-loading': true
        },
        'img': {
          _attr: {
            'lazy-src': process.env.RESIZE_URL + process.env.CDN_URL + slide.attachmentUrl + '?q=' + process.env.IMAGE_QUALITY
          }
        },
        '#caption': isWork ? null: slide.caption,
        '#meta': isWork ? {
          '#title': slide.title,
          '#date': new Date(slide.date).getFullYear(),
          '#dimensions': slide.dimensions,
          '#medium': slide.medium,
        } : null
      }
    })
  })
  el.id = data.id
  el.index = lastSlide[data.id] || 0
  el.start = start.bind(el)
  el.stop = stop.bind(el)
  el.show = show.bind(el)
  el.prev = prev.bind(el)
  el.next = next.bind(el)
  el.hide = el.stop
  return el
}

function start () {
  this.show()
  this._timer = window.setInterval(this.next, 4000)
}

function stop () {
  clearInterval(this._timer)
  delete this._timer
}

function show () {
  lastSlide[this.id] = this.index
  Array.prototype.slice.call(this.childNodes).forEach(function (slide) {
    slide.classList.remove('active')
  })
  var nextSlide = this.childNodes[this.index]
  var nextNextSlide = nextSlide.nextSibling
  nextSlide.classList.add('active')
  unlazy(nextSlide)
  unlazy(nextNextSlide)
}

function unlazy (node) {
  if (!node) return
  var img = node.querySelector('img')
  var src = img.getAttribute('lazy-src')
  if (src) {
    img.setAttribute('src', src)
    img.removeAttribute('lazy-src')
    img.onload = function () {
      img.parentNode.classList.remove('lazy-loading')
    }
  }
}

function prev () {
  if (--this.index < 0) this.index = this.childNodes.length - 1
  this.show()
}

function next () {
  if (++this.index >= this.childNodes.length) this.index = 0
  this.show()
}
