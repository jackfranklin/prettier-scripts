const {
  checkDependencyInstalledLocally,
  getExecutable,
} = require('./executables')

const { error, trace } = require('./log')
const { preparePrettierCliArguments } = require('./parse-arguments')
const { invariant } = require('./invariant')

const { execShellCommand } = require('./util')

exports.prepareCommand = args => {
  const shouldWrite = args.write === true
  delete args.write

  const prettierExists = checkDependencyInstalledLocally('prettier')
  const argsToPassToPrettier = preparePrettierCliArguments(args)

  invariant(prettierExists, 'Could not find prettier as a local dependency.')

  args.usePrettierEslint &&
    invariant(
      checkDependencyInstalledLocally('prettier-eslint'),
      'Could not find prettier-eslint as a local dependency.'
    )

  const hasPassedBothChangedAndTargets =
    args.changed === true && args.targets && args.targets.length > 0

  invariant(
    hasPassedBothChangedAndTargets === false,
    'You passed --changed and a list of files. You may only pass one or the other.'
  )

  const execPath = getExecutable(
    args.usePrettierEslint ? 'prettier-eslint' : 'prettier'
  )

  trace('Running', `git diff HEAD --name-only`, 'to find changed files')
  const changedGitFiles = execShellCommand('git diff HEAD --name-only')

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
    shouldWrite === true ? '--write' : '--list-different',
    args.changed ? changedGitFileNames : `'${args.targets}'`,
  ]
    .filter(x => x)
    .join(' ')

  return { command, changedGitFileNames }
}
