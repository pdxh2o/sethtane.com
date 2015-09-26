exports.generate = function (url) {
  if (typeof url === 'number') return url + ''
  return url && url.toLowerCase()
                   .replace(/([a-z0-9])([^a-z0-9-]+)([a-z0-9])/g, '$1 $3')
                   .replace(/[^a-z0-9-]+/g, ' ')
                   .replace(/ +/g, '-')
}

exports.match = function (slug) {
  return slug ? new RegExp('^' + slug.replace(/-/g, '[^a-zA-Z0-9]*') + '$', 'i') : undefined
}
