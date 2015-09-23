module.exports = Result

var inherits = require('inherits')
var Model = require('../model')

inherits(Result, Model)

function Result () {
  Model.apply(this, arguments)
}
