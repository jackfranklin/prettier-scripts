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
    [argv.semi === false ? 'no-semi' : 'semi']: true,
  }
  prettierArgsToPassThrough.forEach(a => (parsedArgs[a] = argv[a]))

  return parsedArgs
}
