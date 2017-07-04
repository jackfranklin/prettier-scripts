#!/usr/bin/env node

const isCLI = require.main === module

const { argv } = require('yargs')

const { error } = require('../log')
const { checkDependencyInstalledLocally } = require('../index')

const processCommandLineArguments = () => {
  const { argv } = require('yargs')
  const usePrettierEslint = argv['prettier-eslint'] === true

  return {
    usePrettierEslint,
    targets: argv._,
  }
}

const checkPrettierCLI = args => {
  const prettierExists = checkDependencyInstalledLocally('prettier')
  const { execShellCommand } = require('../util')

  if (!prettierExists) {
    error('Could not find prettier as a local dependency')
  }

  if (
    args.usePrettierEslint &&
    !checkDependencyInstalledLocally('prettier-eslint')
  ) {
    error('Could not find prettier-eslint as a local dependency')
  }

  const execPath = `./node_modules/.bin/prettier`
  const command = [
    execPath,
    '--no-semi',
    '--single-quote',
    '--trailing-comma es5',
    'src',
  ].join(' ')
  const prettierOutput = execShellCommand(command)
}

if (isCLI) {
}

module.exports = {
  checkPrettierCLI,
}
