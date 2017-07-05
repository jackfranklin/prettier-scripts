const shell = require('shelljs')

const execShellCommand = command =>
  shell.exec(command, {
    silent: true,
  })

module.exports = {
  execShellCommand,
}
