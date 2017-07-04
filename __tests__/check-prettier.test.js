const chalk = require('chalk')

const mockCore = obj => jest.mock('../index', () => obj)
const util = require('../util')

beforeEach(() => {
  util.execShellCommand = jest.fn()
})

test('check-prettier output when prettier and prettier-eslint is not available', () => {
  mockCore({
    checkDependencyInstalledLocally: () => false,
  })

  const { checkPrettierCLI } = require('../bin/check-prettier')

  checkPrettierCLI({ usePrettierEslint: true })

  expect(console.error).toHaveBeenCalledWith(
    `ERROR: ${chalk.red('Could not find prettier as a local dependency')}`
  )
  expect(console.error).toHaveBeenCalledWith(
    `ERROR: ${chalk.red(
      'Could not find prettier-eslint as a local dependency'
    )}`
  )
})

test('it calls Prettier with all the right arguments', () => {
  mockCore({
    checkDependencyInstalledLocally: () => true,
  })

  const { checkPrettierCLI } = require('../bin/check-prettier')

  checkPrettierCLI({
    'no-semi': true,
    'single-quote': true,
    'trailing-comma': 'es5',
    targets: 'src',
  })

  expect(util.execShellCommand).toHaveBeenCalledWith(
    `./node_modules/.bin/prettier --no-semi --single-quote --trailing-comma es5 --list-different src`
  )
})
