const chalk = require('chalk')

const error = err => console.log('ERROR: ' + chalk.red(err))

module.exports = {
  error,
}
