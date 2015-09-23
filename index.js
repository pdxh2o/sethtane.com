var db = require('./src/db')
var router = require('uri-router')

db.fetch(function (err) {
  if (err) throw err

  router({
    watch: 'pathname',
    outlet: '#nav-outlet',
    routes: {
      '.*': require('./src/nav')
    }
  })

  router({
    watch: 'pathname',
    outlet: '#page-outlet',
    routes: {
      '/search': require('./src/search'),
      '.*': require('./src/pages')
    }
  })
})
