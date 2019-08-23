const { URL } = require('url')
const request = require('request')
const _ = require('lodash')
const logger = require('../util/logger')(__filename)
const config = require('../config')

// If the upstream call causes one of these errors, we'll respond with corresponding
// http status
// Error code reference: https://nodejs.org/api/errors.html#errors_common_system_errors
const ERROR_CODE_TO_HTTP_STATUS = {
  ECONNRESET: 503,
  ETIMEDOUT: 503,
}

const HEADERS_TO_NOT_PROXY = [
  'connection',
  'content-length',
  'content-md5',
  'host',
  'transfer-encoding',
]

function getRequestOpts(req) {
  logger.debug('Incoming request headers', JSON.stringify(req.headers))

  const headers = _.omit(req.headers, HEADERS_TO_NOT_PROXY)
  const path = req.originalUrl
  const opts = {
    url: config.ORIGIN_BASE_URL + path,
    method: req.method,
    headers,
    timeout: config.REQUEST_TIMEOUT,
  }

  if (req.body && !_.isEmpty(req.body)) {
    opts.body = req.body
  }

  opts.headers['x-key'] = config.ORIGIN_KEY
  opts.headers['x-user-name'] = req.user.displayName
  opts.headers['x-user-email'] = req.user.email
  opts.headers['x-user-photo-url'] = req.user.photoUrl

  return opts
}

function handleUpstreamError(err, res) {
  logger.error('Error when requesting upstream:', err)

  if (_.has(ERROR_CODE_TO_HTTP_STATUS, err.code)) {
    return res.sendStatus(ERROR_CODE_TO_HTTP_STATUS[err.code])
  }

  return res.sendStatus(500)
}

function proxyRequest(req, res) {
  const reqOpts = getRequestOpts(req)

  logger.debug('Request opts to origin', JSON.stringify(reqOpts))

  request(reqOpts)
    .on('error', (err) => {
      if (err) {
        handleUpstreamError(err, res)
      }
    })
    .pipe(res)
}

function createProxy() {
  return function proxy(req, res, next) {
    try {
      proxyRequest(req, res)
    } catch (err) {
      logger.error('Error when proxying:', err)
      next(err)
    }
  }
}

module.exports = createProxy
