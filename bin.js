#!/usr/bin/env node
'use strict'

var util = require('util')
var log = require('single-line-log').stdout
var chalk = require('chalk')
var multi = require('./')

var port = parseInt(process.argv[2], 10)
var targets = process.argv.slice(3).map(function (target) {
  target = ~target.indexOf(':') ? target.split(':') : [undefined, target]
  return { host: target[0], port: parseInt(target[1], 10) }
})

if (Number.isNaN(port) || !targets.length) usage()

var connections = []

var proxy = multi(targets).listen(port, function () {
  console.log('Proxy server listening on port %s', chalk.yellow(proxy.address().port))
})

proxy.on('connection', function (c) {
  connections.push(c)
  draw()
  c.on('data', draw)
  c.on('end', draw)
})

function draw () {
  setTimeout(function () {
    log(connections.map(function (c, i) {
      var lines = c.targets.map(function (t) {
        var target = util.format('%s:%s',
          chalk.green(t._target.host || 'localhost'),
          chalk.yellow(t._target.port))

        if (t.destroyed) return util.format(' -> %s: %s', target, chalk.red('destroyed'))

        return util.format(' -> %s - read: %s, written: %s',
          target,
          chalk.magenta(t.bytesRead),
          chalk.magenta(t.bytesWritten))
      })

      lines.unshift(util.format('\nConnection %d', i + 1))

      return lines.join('\n')
    }).join('\n'))
  }, 10)
}

function usage () {
  console.log('Usage:')
  console.log('')
  console.log('  fork-proxy port [forward_host:]forward_port')
  console.log('')
  process.exit(1)
}
