'use stirct'

var test = require('tape')
var net = require('net')
var afterAll = require('after-all')
var multi = require('./')

test(function (t) {
  t.plan(3)

  var next = afterAll(function () {
    var proxy = multi([
      { port: t1.address().port },
      { port: t2.address().port }
    ])

    proxy.listen()

    var source = net.connect({ port: proxy.address().port })

    source.on('data', function (chunk) {
      t.equal(chunk.toString(), '1hello')
    })

    source.write('hello')
  })

  var t1 = net.createServer(function (c) {
    c.on('data', function (chunk) {
      t.equal(chunk.toString(), 'hello')
      c.write('1')
      c.write(chunk)
    })
  })

  var t2 = net.createServer(function (c) {
    c.on('data', function (chunk) {
      t.equal(chunk.toString(), 'hello')
      c.write('2')
      c.write(chunk)
    })
  })

  t1.listen(next())
  t2.listen(next())
})

test('end', function (t) {
  t.end()
  process.exit()
})
