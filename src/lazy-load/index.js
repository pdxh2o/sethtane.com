function LazyLoader () {
  this.images = []
  this._onscroll = this._onscroll.bind(this)
  this._doload = this._doload.bind(this)
  document.addEventListener('scroll', this._onscroll)
}

LazyLoader.prototype.scan = function () {
  this.images = Array.prototype.slice.call(document.querySelectorAll('[lazy-src]'))
  this.images.forEach(function (image) {
    var lazySrc = image.getAttribute('lazy-src')
    if (lazySrc) {
      image.parentNode.classList.add('lazy-loading')
    }
  })
  this._onscroll()
}

LazyLoader.prototype._onscroll = function () {
  clearTimeout(this._debounce)
  this._debounce = setTimeout(this._doload, 50)
}

LazyLoader.prototype._doload = function () {
  this.images.forEach(function (image) {
    var rect = image.getBoundingClientRect()
    if (rect.top > -image.parentNode.offsetHeight && rect.top <= document.body.clientHeight) {
      var lazySrc = image.getAttribute('lazy-src')
      if (lazySrc) {
        image.setAttribute('src', lazySrc)
        image.removeAttribute('lazy-src')
        image.onload = function () {
          image.parentNode.classList.remove('lazy-loading')
        }
      }
    }
  })
}

module.exports = new LazyLoader()
