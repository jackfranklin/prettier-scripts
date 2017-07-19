const { error } = require('./log')

exports.invariant = (condition, message, exit = 1) => {
  if (!condition) {
    error(message)
    process.exit(exit)
  }
}
