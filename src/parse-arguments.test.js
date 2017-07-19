const {
  processCommandLineArguments,
  preparePrettierCliArguments,
} = require('./parse-arguments')

describe('processCommandLineArguments', () => {
  test('it ignores any arguments that are passed through to prettier', () => {
    const argv = {
      'trailing-comma': 'es5',
      'print-width': 120,
    }

    expect(processCommandLineArguments(argv)).toEqual(
      Object.assign(
        {
          changed: false,
          usePrettierEslint: false,
        },
        argv
      )
    )
  })

  test('it sets semi only if it has been passed in', () => {
    expect(processCommandLineArguments({})).not.toEqual(
      expect.objectContaining({ semi: false })
    )
    expect(processCommandLineArguments({ semi: false })).toEqual(
      expect.objectContaining({ semi: false })
    )
    expect(processCommandLineArguments({ semi: true })).toEqual(
      expect.objectContaining({ semi: true })
    )
  })

  test('it can decide if to use prettier-eslint or not', () => {
    const argv = {
      'prettier-eslint': true,
    }

    expect(processCommandLineArguments(argv)).toEqual({
      usePrettierEslint: true,
      changed: false,
    })
  })

  test('it knows if it should run on changed files or not', () => {
    const argv = {
      changed: true,
    }

    expect(processCommandLineArguments(argv)).toEqual({
      usePrettierEslint: false,
      changed: true,
    })
  })
})

describe('preparePrettierCliArguments', () => {
  test('it takes the parsed args and turns them into CLI arguments, ignoring any non prettier options', () => {
    const args = {
      usePrettierEslint: true,
      semi: false,
      'print-width': 120,
    }

    expect(preparePrettierCliArguments(args)).toEqual(
      '--no-semi --print-width 120'
    )
  })
})
