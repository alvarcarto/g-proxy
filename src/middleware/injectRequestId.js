const uuidv4 = require('uuid/v4')

const createInjectRequestId = () => (req, res, next) => {
  req.id = req.headers['x-request-id'] || req.headers['x-amzn-trace-id'] || `aito-${uuidv4()}`
  next()
}

module.exports = createInjectRequestId
