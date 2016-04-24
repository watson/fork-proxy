'use strict'

var net = require('net')
var multi = require('multi-write-stream')

module.exports = function (targets) {
  return net.createServer(function (c) {
    c.targets = targets.map(function (target) {
      var socket = net.connect(target)
      socket._target = target
      return socket
    })

    // proxy data from source to all targets
    c.pipe(multi(c.targets))

    // proxy data from target 1 back to source
    c.targets[0].pipe(c)
  })
}
