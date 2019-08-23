const { ValidationError } = require('express-json-validator-middleware')

// All 4 parameters are needed for function signature so Express detects that it is a error
// handling middleware
// eslint-disable-next-line
const createErrorResponder = () => (err, req, res, next) => {
  let status = err.status ? err.status : 500
  let { message } = err
  if (err instanceof ValidationError) {
    status = 400
    message = err.validationErrors
  }
  res.status(status)
  res.json({
    message,
  })
}

module.exports = createErrorResponder
