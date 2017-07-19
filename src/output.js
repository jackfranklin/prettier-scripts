const chalk = require('chalk')
const { info, error, debug } = require('./log')

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
