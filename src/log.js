const getLogger = require('loglevel-colored-level-prefix')
const options = {
  prefix: 'prettier-scripts',
  level: process.env.LOG_LEVEL || 'info',
}
const logger = getLogger(options)

module.exports = logger
