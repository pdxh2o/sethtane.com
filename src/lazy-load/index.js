function LazyLoader () {
  this.images = []
  this._onscroll = this._onscroll.bind(this)
  document.addEventListener('scroll', this._onscroll)
}

LazyLoader.prototype.scan = function () {
  this.images = Array.prototype.slice.call(document.querySelectorAll('[lazy-src]'))
  this._onscroll()
}

LazyLoader.prototype._onscroll = function () {
  for (var i = 0; i < this.images.length; i++) {
    var image = this.images[i]
    var rect = image.getBoundingClientRect()
    if (rect.top > -image.parentNode.offsetHeight && rect.top <= document.body.clientHeight) {
      var lazySrc = image.getAttribute('lazy-src')
      if (lazySrc) {
        image.setAttribute('src', lazySrc)
        image.removeAttribute('lazy-src')
      }
    }
  }
}

module.exports = new LazyLoader()
