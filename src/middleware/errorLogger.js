const _ = require('lodash')
const createLogger = require('../util/logger')

function getLogLevel(status) {
  return status >= 500 ? 'error' : 'warn'
}

function deepSupressLongStrings(obj) {
  const newObj = {}
  _.each(obj, (val, key) => {
    if (_.isString(val) && val.length > 1000) {
      newObj[key] = `${val.slice(0, 1000)} ... [CONTENT SLICED]}`
    } else if (_.isPlainObject(val)) {
      newObj[key] = deepSupressLongStrings(val)
    } else {
      newObj[key] = val
    }
  })

  return newObj
}

function logRequestDetails(log, req) {
  // TODO: Fix log function to support objects
  // TODO: Encrypt body logging?
  log(`Request headers: ${JSON.stringify(deepSupressLongStrings(req.headers))}`)
  log(`Request body: ${JSON.stringify(deepSupressLongStrings(req.body))}`)
}

function createErrorLogger(_opts) {
  const opts = _.merge({
    logRequest: (status) => {
      return status >= 400 && status !== 404 && status !== 503
    },
    logStackTrace: (status) => {
      return status >= 500 && status !== 503
    }
  }, _opts)

  return function errorHandler(err, req, res, next) {
    const status = err.status ? err.status : 500
    const logLevel = getLogLevel(status)
    const logger = createLogger(`request:${req.id}`)
    const log = logger[logLevel]

    if (opts.logRequest(status)) {
      logRequestDetails(log, req, status)
    }

    if (opts.logStackTrace(status)) {
      log(err)
      log(err.stack)
    } else {
      log(err.toString())
    }

    next(err)
  }
}

module.exports = createErrorLogger
