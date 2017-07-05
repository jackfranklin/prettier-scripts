#!/usr/bin/env node

const isCLI = require.main === module
const shell = require('shelljs')

const { argv } = require('yargs')

const { error } = require('../log')
const { checkDependencyInstalledLocally } = require('../index')

const processCommandLineArguments = () => {
  const { argv } = require('yargs')
  console.log('got argv', argv)
  const usePrettierEslint = argv['prettier-eslint'] === true
  const check = argv.check === true
  const changed = argv.changed === true

  return {
    usePrettierEslint,
    check,
    changed,
    targets: argv._,
    'trailing-comma': argv['trailing-comma'],
    [argv.semi ? 'semi' : 'no-semi']: true,
    'single-quote': argv['single-quote'],
    'double-quote': argv['double-quote'],
    write: argv.write,
  }
}

const checkPrettierCLI = args => {
  const prettierExists = checkDependencyInstalledLocally('prettier')

  const nonPrettierArgs = [
    'use-prettier-eslint',
    'usePrettierEslint',
    'check',
    'changed',
    'targets',
  ]

  const argsToPassToPrettier = Object.keys(args)
    .filter(arg => {
      return nonPrettierArgs.indexOf(arg) === -1
    })
    .map(arg => {
      const value = args[arg]
      if (value == undefined) return null
      return value === true ? `--${arg}` : `--${arg} ${value}`
    })
    .filter(x => x !== null)
    .join(' ')

  const { execShellCommand } = require('../util')

  if (!prettierExists) {
    error('Could not find prettier as a local dependency')
    process.exit(1)
  }

  if (
    args.usePrettierEslint &&
    !checkDependencyInstalledLocally('prettier-eslint')
  ) {
    error('Could not find prettier-eslint as a local dependency')
    process.exit(1)
  }

  if (args.check && args.write) {
    error(
      'You passed both --check and --write which is not valid. You may only pass one.'
    )
    process.exit(1)
  }

  if (args.changed && args.targets.length > 0) {
    error(
      'You passed --changed and a list of files. You may only pass one or the other.'
    )
    process.exit(1)
  }

  const execPath = args.usePrettierEslint
    ? `./node_modules/.bin/prettier-eslint`
    : `./node_modules/.bin/prettier`

  const files = shell.exec('git diff HEAD --name-only', {
    silent: true,
  })

  const changedGitFileNames = files.stdout
    .split('\n')
    .filter(f => {
      return f.indexOf('.js') > -1
    })
    .join(' ')

  const command = [
    execPath,
    argsToPassToPrettier,
    args.check ? '--list-different' : null,
    args.changed ? changedGitFileNames : `'${args.targets}'`,
  ]
    .filter(x => x !== null)
    .join(' ')

  console.log('got command', command)

  const prettierOutput = execShellCommand(command)
  console.log('all output', prettierOutput)
  const { code, stdout } = prettierOutput

  if (code !== 0) {
    error('Files were found that did not pass')
    stdout.split('\n').filter(x => x).forEach(f => console.log(`- ${f}`))
  }
}

if (isCLI) {
  const args = processCommandLineArguments()
  console.log('got args', args)
  checkPrettierCLI(args)
}

module.exports = {
  checkPrettierCLI,
}
