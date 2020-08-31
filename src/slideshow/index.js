module.exports = SlideshowView

var hg = require('hyperglue2')
var template = require('./index.html')

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
            'lazy-src': process.env.RESIZE_URL + slide.attachmentUrl + '?q=' + process.env.IMAGE_QUALITY
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
  el.index = 0
  el.start = start.bind(el)
  el.stop = stop.bind(el)
  el.show = show.bind(el)
  el.prev = prev.bind(el)
  el.next = next.bind(el)
  el.hide = el.stop
  el.addEventListener('click', onclick.bind(el))
  Object.defineProperty(el, 'slides', {
    get: () => Array.from(el.querySelectorAll('li'))
  })
  return el
}

function onclick (evt) {
  console.log(evt.target, evt.currentTarget)
  if (evt.target.tagName !== 'BUTTON') return
  this[evt.target.id]()
}

function start () {
  this.show()
  if (this.playing) return
  this.playing = true
  this.querySelector('#stop').classList.remove('hidden')
  this.querySelector('#start').classList.add('hidden')
  this._timer = window.setTimeout(this.next, 4000)
}

function stop () {
  this.playing = false
  this.querySelector('#stop').classList.add('hidden')
  this.querySelector('#start').classList.remove('hidden')
  clearTimeout(this._timer)
  delete this._timer
}

function show () {
  var slides = this.slides
  slides.forEach(slide => slide.classList.remove('active'))
  var nextSlide = slides[this.index]
  nextSlide.classList.add('active')
  unlazy(nextSlide)
  var last = slides.length - 1
  if (this.index === 0) {
    unlazy(slides[last])
    unlazy(slides[this.index + 1])
  } else if (this.index === last) {
    unlazy(slides[this.index - 1])
    unlazy(slides[0])
  } else {
    unlazy(slides[this.index - 1])
    unlazy(slides[this.index + 1])
  }
  if (this.playing) {
    clearTimeout(this._timer)
    this._timer = window.setTimeout(this.next, 4000)
  }
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
  if (--this.index < 0) this.index = this.slides.length - 1
  this.show()
}

function next () {
  if (++this.index >= this.slides.length) this.index = 0
  this.show()
}
