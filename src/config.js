const {
  getOptionalEnv,
  getRequiredEnv,
  string,
  number,
} = require('./util/env')
require('dotenv').config()

const config = {
  // Required
  ORIGIN_BASE_URL: getRequiredEnv('ORIGIN_BASE_URL', string),
  ORIGIN_KEY: getRequiredEnv('ORIGIN_KEY', string),
  GOOGLE_CLIENT_ID: getRequiredEnv('GOOGLE_CLIENT_ID', string),
  GOOGLE_CLIENT_SECRET: getRequiredEnv('GOOGLE_CLIENT_SECRET', string),
  CALLBACK_URL: getOptionalEnv('CALLBACK_URL', string),
  SESSION_SECRET: getRequiredEnv('SESSION_SECRET', string),
  ALLOWED_EMAIL_DOMAIN: getRequiredEnv('ALLOWED_EMAIL_DOMAIN', string),

  // Optional
  PORT: getOptionalEnv('PORT', number, 3005),
  NODE_ENV: getOptionalEnv('NODE_ENV', string, 'development'),
  LOG_LEVEL: getOptionalEnv('LOG_LEVEL', string, 'info'),
  // Max limit what this express app will accept as body
  // Value is parsed with https://www.npmjs.com/package/bytes
  MAX_BODY_SIZE: getOptionalEnv('MAX_BODY_SIZE', string, '50mb'),
}

config.CALLBACK_URL = getOptionalEnv('CALLBACK_URL', string, `http://localhost:${config.PORT}/login/return`)

module.exports = config
