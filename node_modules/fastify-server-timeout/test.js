'use strict'

const t = require('tap')
const Fastify = require('fastify')
const sget = require('simple-get')

const plugin = require('./')

t.test('timeout should be set correctly', t => {
  t.plan(3)

  const fastify = Fastify({ logger: { level: 'silent' } })
  fastify.register(plugin, {
    serverTimeout: 100
  })
  fastify.get('/timeout', async function (req, res) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return 5
  })
  fastify.get('/ok', async function (req, res) {
    return 5
  })

  fastify.listen(0, function (err) {
    t.error(err)
    fastify.server.unref()

    const port = fastify.server.address().port

    t.test('http real request', t => {
      t.test('ok', t => {
        t.plan(2)
        sget('http://localhost:' + port + '/ok', function (err, res) {
          t.error(err)
          t.equal(res.statusCode, 200)

          t.end()
        })
      })

      t.test('timeout', t => {
        t.plan(2)
        sget('http://localhost:' + port + '/timeout', function (err, res) {
          t.ok(err)
          t.equal(err.code, 'ECONNRESET')

          t.end()
        })
      })

      t.end()
    })

    t.test('inject', t => {
      t.test('ok', t => {
        t.plan(2)
        fastify.inject({
          method: 'GET',
          url: '/ok'
        }, function (err, res) {
          t.error(err)
          t.equal(res.statusCode, 200)

          t.end()
        })
      })

      t.test('timeout is ignored', t => {
        t.plan(2)
        fastify.inject({
          method: 'GET',
          url: '/timeout'
        }, async function (err, res) {
          t.error(err)
          t.equal(res.statusCode, 200)

          t.end()
        })
      })

      t.end()
    })
  })
})
