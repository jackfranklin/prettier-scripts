const chalk = require('chalk')
const { info, error, debug } = require('./log')
const { version } = require('../package.json')

exports.outputRunningInfo = ({ args, changedGitFileNames, command }) => {
  const exec = chalk.green(
    args.usePrettierEslint ? 'prettier-eslint' : 'prettier'
  )

  if (args.changed === true) {
    info(
      `Running ${exec} against changed files:`,
      chalk.blue(changedGitFileNames)
    )
  } else {
    info(`Running ${exec} against targets:`, chalk.blue(args.targets))
  }
  debug(`Executing: ${command}`)
}

exports.displayCheckOutput = ({ stdout, code }) => {
  if (code !== 0) {
    error('Files were found that did not pass:')
    stdout.split('\n').filter(x => x).forEach(f => error(`- ${f}`))
    process.exit(code)
  } else {
    info('Prettier check passed successfully.')
    process.exit(0)
  }
}

exports.displayWriteOutput = ({ stdout }) => {
  info('Prettier has formatted the following files for you:')

  stdout
    .split('\n')
    .map(x => x.split('\u001b[2K\u001b[1G')[1])
    .filter(x => !!x)
    .forEach(x => info(`- ${x}`))
}

exports.help = `
  prettier-scripts version ${version}

  Run either prettier-scripts-check or prettier-scripts-write.

  All Prettier options (--semi, --no-semi, and so on) are passed through to Prettier.
    - You should run prettier --help to get a full list of those options.

  Pass --prettier-eslint to run your files through prettier-eslint rather than standalone prettier.

  You need to pass either --changed or --targets 'glob' to tell prettier-scripts what files to check.

    - with --changed, prettier-scripts will use git to calculate the changed files and execute against them
      - you can additionally pass --filter-changed with a glob to run only changed files that match the glob:
      - prettier-scripts-check --changed --filter-changed '**/*.js'

    - with --targets, pass a file glob and prettier-scripts will use that:
      - prettier-scripts-check --targets 'src/**/*.js'

  Full documentation is available on GitHub: https://github.com/jackfranklin/prettier-scripts
`
