const npmWhich = require('npm-which')(process.cwd())

const checkDependencyInstalledLocally = name => {
  return npmWhich.sync(name)
}

const getExecutable = name => npmWhich.sync(name)

module.exports = {
  checkDependencyInstalledLocally,
  getExecutable,
}
