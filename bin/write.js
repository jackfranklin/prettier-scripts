#!/usr/bin/env node

const shell = require('shelljs')

const { argv } = require('yargs')
const chalk = require('chalk')

const { error, debug, trace, info } = require('../log')
const { checkDependencyInstalledLocally } = require('../index')
const npmWhich = require('npm-which')(process.cwd())

const processCommandLineArguments = () => {
  const { argv } = require('yargs')
  const usePrettierEslint = argv['prettier-eslint'] === true
  const changed = argv.changed === true

  const prettierArgsToPassThrough = [
    'trailing-comma',
    'single-quote',
    'double-quote',
    'print-width',
    'no-bracket-spacing',
    'jsx-bracket-same-line',
    'use-tabs',
    'tab-width',
    'parser',
  ]

  const parsedArgs = {
    usePrettierEslint,
    changed,
    targets: argv.targets,
    [argv.semi === false ? 'no-semi' : 'semi']: true,
  }
  prettierArgsToPassThrough.forEach(a => (parsedArgs[a] = argv[a]))

  return parsedArgs
}

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

  const execPath = npmWhich.sync(
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
    '--write',
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

  info('Prettier has checked and formatted the following files for you:')

  stdout
    .split('\n')
    .map(x => x.replace('\u001b[2K\u001b[1G', '__'))
    .map(x => x.split('__')[1])
    .filter(x => !!x)
    .forEach(x => info(`- ${x}`))

  process.exit(0)
}

const run = () => {
  const args = processCommandLineArguments()
  checkPrettierCLI(args)
}

run()
