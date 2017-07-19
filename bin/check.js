#!/usr/bin/env node

const shell = require('shelljs')

const { argv } = require('yargs')
const chalk = require('chalk')

const { error, debug, trace, info } = require('../src/log')
const {
  checkDependencyInstalledLocally,
  getExecutable,
} = require('../src/executables')

const { outputRunningInfo, displayCheckOutput } = require('../src/output')

const { processCommandLineArguments } = require('../src/parse-arguments')
const { prepareCommand } = require('../src/prepare-command')

const { execShellCommand } = require('../src/util')

const run = () => {
  const { argv } = require('yargs')
  const args = processCommandLineArguments(argv)

  const { command, changedGitFileNames } = prepareCommand(
    Object.assign({}, args, { write: false })
  )

  outputRunningInfo({ args, changedGitFileNames, command })

  const prettierOutput = execShellCommand(command)

  displayCheckOutput(prettierOutput)
}

run()
