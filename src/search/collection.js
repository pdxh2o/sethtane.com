module.exports = SearchCollection

var inherits = require('inherits')
var Collection = require('../collection')
var Storage = require('../storage')
var Result = require('./model')

inherits(SearchCollection, Collection)

function SearchCollection (query) {
  var storage = new Storage('search', 'query=' + query)
  this.decades = []
  this.categories = []
  Collection.call(this, storage, Result)
}
