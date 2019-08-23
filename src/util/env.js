const path = require('path')
const { inspect } = require('util')
const fs = require('fs')
const _ = require('lodash')

function string(val) {
  return String(val)
}

function boolean(val, name) {
  if (val !== 'true' && val !== 'false') {
    throw new Error(`${name} is invalid. Non-boolean value found: ${inspect(val)}`)
  }

  return val === 'true'
}

function number(val, name) {
  const num = Number(val)
  if (!_.isFinite(num)) {
    throw new Error(`${name} is invalid. Non-number value found: ${inspect(val)}`)
  }
  return num
}

function getRequiredEnv(name, castType) {
  const val = process.env[name]
  if (!val) {
    throw new Error(`${name} environment variable is required`)
  }
  return castType(val, name)
}

function getOptionalEnv(name, castType, defaultVal) {
  const val = process.env[name]

  return _.isUndefined(val)
    ? defaultVal
    : castType(val, name)
}


module.exports = {
  string,
  boolean,
  number,
  getRequiredEnv,
  getOptionalEnv,
}
