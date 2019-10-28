const util = require('util')
const express = require('express')
const _ = require('lodash')
const passport = require('passport')
const Strategy = require('passport-google-oauth20')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const errorLogger = require('./middleware/errorLogger')
const errorResponder = require('./middleware/errorResponder')
const injectRequestId = require('./middleware/injectRequestId')
const requestLogger = require('./middleware/requestLogger')
const proxy = require('./middleware/proxy')
const config = require('./config')


const strategy = new Strategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.CALLBACK_URL,
}, (accessToken, refreshToken, profile, cb) => {
  const { displayName, emails, photos } = profile
  const accountEmail = _.find(emails, e => e.type && e.type.toLowerCase() === 'account')
  if (!accountEmail) {
    return cb(new Error(`Invalid emails returned: ${util.inspect(emails)}`))
  }

  if (!_.endsWith(accountEmail.value, config.ALLOWED_EMAIL_DOMAIN)) {
    return cb(new Error(`Unallowed email domain used: ${util.inspect(accountEmail)}`))
  }

  const photoUrl = _.isArray(photos) && photos.length > 0
    ? photos[0].value
    : null

  return cb(null, {
    displayName,
    email: accountEmail.value,
    photoUrl,
  })
})
passport.use(strategy)

passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((obj, cb) => {
  cb(null, obj)
})

function createApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use(injectRequestId())
  app.use(requestLogger())

  app.use(expressSession({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  app.use(bodyParser.raw({
    // By default body parser matches only when content-type matches this type.
    // We want to proxy body content straight to origin so we always want to parse the body as raw
    type: () => true,
    limit: config.MAX_BODY_SIZE,
  }))

  app.get('/login', passport.authenticate('google', { prompt: 'select_account', scope: ['profile', 'email'] }))
  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.get(
    '/login/return',
    passport.authenticate('google', { prompt: 'select_account', failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/')
    }
  )

  app.use((req, res, next) => {
    if (!req.user) {
      return res.redirect('/login')
    }

    return next()
  })
  app.use(proxy())

  app.use(errorLogger())
  app.use(errorResponder())

  return app
}

module.exports = createApp

