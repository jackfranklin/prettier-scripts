// argv here is the object provided by yargs
exports.processCommandLineArguments = argv => {
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
    filterChanged: argv.filterChanged,
  }

  // yargs turns --no-semi into semi: false
  if (argv.hasOwnProperty('semi')) {
    parsedArgs.semi = argv.semi
  }

  prettierArgsToPassThrough.forEach(a => (parsedArgs[a] = argv[a]))

  const argsWithUndefinedRemoved = Object.keys(
    parsedArgs
  ).reduce((finalArgs, argKey) => {
    if (parsedArgs[argKey] != undefined) {
      finalArgs[argKey] = parsedArgs[argKey]
    }
    return finalArgs
  }, {})

  return argsWithUndefinedRemoved
}

exports.preparePrettierCliArguments = args => {
  const nonPrettierArgs = [
    'usePrettierEslint',
    'changed',
    'targets',
    'filterChanged',
  ]

  const argsToPassToPrettier = Object.keys(args)
    .filter(arg => {
      return nonPrettierArgs.indexOf(arg) === -1
    })
    .map(arg => {
      const value = args[arg]
      if (value == undefined) return null
      if (value === false) {
        return `--no-${arg}`
      }

      return value === true ? `--${arg}` : `--${arg} ${value}`
    })
    .filter(x => x !== null)
    .join(' ')
    .trim()

  return argsToPassToPrettier
}
