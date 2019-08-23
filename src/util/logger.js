const path = require('path')
const winston = require('winston')
const _ = require('lodash')
const config = require('../config')

const COLORIZE = config.NODE_ENV === 'development'

function createLogger(label) {
  const isPath = label.indexOf('/') !== -1
  const logLabel = isPath
    ? path.basename(label)
    : label

  const formatters = [
    winston.format.timestamp(),
    winston.format.printf(nfo => `${nfo.timestamp} [${logLabel}] ${nfo.level}: ${nfo.message}`)
  ]
  if (COLORIZE) {
    // Add as first formatter
    formatters.unshift(winston.format.colorize())
  }

  const logger = winston.createLogger({
    format: winston.format.combine.apply(null, formatters),
    transports: [new winston.transports.Console({
      level: config.LOG_LEVEL || 'info',
    })],
  })

  function argumentsToString(args) {
    return _.map(args, (arg) => {
      if (_.isObject(arg)) return JSON.stringify(arg)
      return arg
    }).join(' ')
  }

  const loggerWrapper = {
    error: (...args) => logger.log.apply(logger, ['error', argumentsToString(args)]),
    warn: (...args) => logger.log.apply(logger, ['warn', argumentsToString(args)]),
    info: (...args) => logger.log.apply(logger, ['info', argumentsToString(args)]),
    verbose: (...args) => logger.log.apply(logger, ['verbose', argumentsToString(args)]),
    debug: (...args) => logger.log.apply(logger, ['debug', argumentsToString(args)]),
    silly: (...args) => logger.log.apply(logger, ['silly', argumentsToString(args)]),
  }

  return loggerWrapper
}

module.exports = createLogger
