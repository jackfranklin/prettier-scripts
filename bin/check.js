#!/usr/bin/env node

const shell = require('shelljs')

const { argv } = require('yargs')
const chalk = require('chalk')

const { error, debug, trace, info } = require('../log')
const {
  checkDependencyInstalledLocally,
  getExecutable,
} = require('../index')

const { processCommandLineArguments } = require('../src/parse-arguments')

const checkPrettierCLI = args => {
  const prettierExists = checkDependencyInstalledLocally('prettier')

  const nonPrettierArgs = [
    'use-prettier-eslint',
    'usePrettierEslint',
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

  if (args.changed && args.targets.length > 0) {
    error(
      'You passed --changed and a list of files. You may only pass one or the other.'
    )
    process.exit(1)
  }

  const execPath = getExecutable(
    args.usePrettierEslint ? 'prettier-eslint' : 'prettier'
  )

  trace('Running', `git diff HEAD --name-only`, 'to find changed files')
  const changedGitFiles = shell.exec('git diff HEAD --name-only', {
    silent: true,
  })

  const changedGitFileNames = changedGitFiles.stdout

  if (args.changed) {
    if (changedGitFileNames.length === 0) {
      error('No files were found to be changed, aborting.')
      process.exit(1)
    }
  }

  const command = [
    execPath,
    argsToPassToPrettier,
    '--list-different',
    args.changed ? changedGitFileNames : `'${args.targets}'`,
  ].join(' ')

  if (args.changed === true) {
    info(
      'Running Prettier against changed files:',
      chalk.blue(changedGitFileNames)
    )
  } else {
    info(
      'Running Prettier against the given targets:',
      chalk.blue(args.targets)
    )
  }

  debug(`Executing: ${command}`)

  const prettierOutput = execShellCommand(command)
  const { code, stdout } = prettierOutput

  if (code !== 0) {
    error('Files were found that did not pass.')
    stdout.split('\n').filter(x => x).forEach(f => error(`- ${f}`))
  } else {
    info('Prettier check passed successfully.')
    process.exit(0)
  }
}

const run = () => {
  const { argv } = require('yargs')
  const args = processCommandLineArguments(argv)
  checkPrettierCLI(args)
}

run()
