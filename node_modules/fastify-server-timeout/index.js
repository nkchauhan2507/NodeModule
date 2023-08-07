'use strict'

const NODE_SERVER_DEFAULT_TIMEOUT = 120000

module.exports = function (fastify, opts, next) {
  const timeout = opts.serverTimeout || NODE_SERVER_DEFAULT_TIMEOUT
  fastify.server.setTimeout(timeout)

  next()
}
