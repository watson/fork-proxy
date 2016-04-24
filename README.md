# fork-proxy

Proxy a single incomming TCP connection to multiple remote TCP servers.
Only the response from one target will be proxied back to the client.

Can be used both from the command line and programmatically.

[![Build status](https://travis-ci.org/watson/fork-proxy.svg?branch=master)](https://travis-ci.org/watson/fork-proxy)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Command Line Usage

```
fork-proxy port [forward_host:]forward_port...
```

The `fork-proxy` command takes the following arguments:

- `port` - The port that it should listen on
- `forwards` - a list of `host:port` combinations to forward TCP traffic
  to. If `host:` is omitted, `localhost` is assumed

The responses from the first forward target will be piped back to the
client. Responses from the remaining forward targets will be ignored.

Example:

```
$ fork-proxy 3000 example.com:80 example.org:80
```

## Programmatic Usage

```js
var multi = require('fork-proxy')

// proxy TCP traffic to both example.com and example.org
var proxy = multi([
  { host: 'example.com', port: 80 },
  { host: 'example.org', port: 80 }
])

// listen for incoming TCP traffic on port 3000
proxy.listen(3000)
```

## API

### `var proxy = multi(targets)`

The module exposes a single constructor function `multi`, which takes an
array of target TCP servers as the first argument. The array must have
at least one element.

Each element in the array must be an object. The object is passed into
[`net.connect()`](https://nodejs.org/api/net.html#net_net_connect_options_connectlistener)
and as such is expected to follow the same API.

The constructor function returns the proxy server which is an instance
of [`net.Server`](https://nodejs.org/api/net.html#net_class_net_server).

Only the response from the first target will be proxied back to the
client. Responses from the remaining targets will be ignored.

Each connection object emitted on the `connection` event will have a
property named `targets`. It's an array containing the sockets created
to connect to the different target servers:

```js
var proxy = multi([{ port: 3001 }, { port: 3002 }])

proxy.on('connection', function (c) {
  console.log('connecting client to %d servers', c.targets.length)
})

proxy.listen(3000)
```

## License

MIT
