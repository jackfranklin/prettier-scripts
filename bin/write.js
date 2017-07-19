#!/usr/bin/env node

const shell = require('shelljs')

const { argv } = require('yargs')
const chalk = require('chalk')

const {
  checkDependencyInstalledLocally,
  getExecutable,
} = require('../src/executables')
const { error, debug, trace, info } = require('../src/log')
const { processCommandLineArguments } = require('../src/parse-arguments')
const { prepareCommand } = require('../src/prepare-command')

const { execShellCommand } = require('../src/util')
const { outputRunningInfo, displayWriteOutput } = require('../src/output')

const run = () => {
  const { argv } = require('yargs')
  const args = processCommandLineArguments(argv)
  const { command, changedGitFileNames } = prepareCommand(
    Object.assign({}, args, { write: true })
  )

  outputRunningInfo({ args, changedGitFileNames, command })

  const prettierOutput = execShellCommand(command)
  displayWriteOutput(prettierOutput)
  process.exit(0)
}

run()
