const path = require('path')
const fs = require('fs')

const checkDependencyInstalledLocally = name => {
  const cwd = process.cwd()
  const executablePath = path.join(cwd, 'node_modules', '.bin', name)
  const exists = fs.existsSync(executablePath)
  return exists
}

module.exports = {
  checkDependencyInstalledLocally,
}
