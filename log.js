const chalk = require('chalk')

const error = err => console.error('ERROR: ' + chalk.red(err))

module.exports = {
  error,
}
