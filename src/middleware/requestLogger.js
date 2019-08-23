// Replicates dev formatting with colors but adds request-id to the format

const chalk = require('chalk')
const morgan = require('morgan')
const config = require('../config')

morgan.token('request-id', req => req.id)

const noColor = s => s

function getColorF(status) {
  if (config.NODE_ENV !== 'development' && config.NODE_ENV !== 'test') {
    return noColor
  }

  if (status >= 500) {
    return chalk.red
  } else if (status >= 400) {
    return chalk.yellow
  } else if (status >= 300) {
    return chalk.cyan
  } else if (status >= 200) {
    return chalk.green
  }

  return noColor
}

function headersSent(res) {
  return typeof res.headersSent !== 'boolean'
    // eslint-disable-next-line
    ? Boolean(res._header)
    : res.headersSent
}

const createRequestLogger = () => morgan((tokens, req, res) => {
  const statusCode = headersSent(res)
    ? res.statusCode
    : undefined
  const colorF = getColorF(statusCode)
  const statusLabel = tokens.status(req, res)

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    colorF(statusLabel),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    `[request:${tokens['request-id'](req, res)}]`,
  ].join(' ')
})

module.exports = createRequestLogger

