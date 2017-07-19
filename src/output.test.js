jest.mock('loglevel-colored-level-prefix', () => {
  return () => ({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  })
})

jest.mock('chalk', () => ({
  blue: jest.fn(x => x),
  green: jest.fn(x => x),
}))

const {
  outputRunningInfo,
  displayCheckOutput,
  displayWriteOutput,
} = require('./output')
const logger = require('./log')
const chalk = require('chalk')

describe('outputRunningInfo', () => {
  it('outputs the information on what is being run', () => {
    outputRunningInfo({
      args: { targets: 'src/*.js' },
      changedGitFileNames: '',
      command: './node_modules/.bin/prettier',
    })
    expect(logger.info).toHaveBeenCalledWith(
      'Running prettier against targets:',
      'src/*.js'
    )
  })

  it('shows the changed files if they are given', () => {
    outputRunningInfo({
      args: { changed: true },
      changedGitFileNames: 'foo.js bar.js',
      command: './node_modules/.bin/prettier',
    })
    expect(logger.info).toHaveBeenCalledWith(
      'Running prettier against changed files:',
      'foo.js bar.js'
    )
  })

  it('logs the full command to debug', () => {
    outputRunningInfo({
      args: { changed: true },
      changedGitFileNames: 'foo.js bar.js',
      command: './node_modules/.bin/prettier',
    })
    expect(logger.debug).toHaveBeenCalledWith(
      'Executing: ./node_modules/.bin/prettier'
    )
  })
})

describe('displayCheckOutput', () => {
  beforeEach(() => jest.spyOn(process, 'exit').mockImplementation(() => {}))

  it('outputs the success message and exits with 0 if it was good', () => {
    displayCheckOutput({ stdout: '', code: 0 })
    expect(logger.info).toHaveBeenCalledWith(
      'Prettier check passed successfully.'
    )
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  it('parses the failed files and logs each of them if there was an error', () => {
    displayCheckOutput({
      stdout: 'foo.js\nbar.js',
      code: 1,
    })
    expect(logger.error).toHaveBeenCalledWith(
      'Files were found that did not pass:'
    )
    expect(logger.error).toHaveBeenCalledWith('- foo.js')
    expect(logger.error).toHaveBeenCalledWith('- bar.js')
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})

describe('displayWriteOutput', () => {
  const weirdPrettierOutputStr = '\u001b[2K\u001b[1G'

  // the Prettier output is kind of weird
  const stdout = [
    `foo.js${weirdPrettierOutputStr}foo.js 44ms`,
    `bar.js${weirdPrettierOutputStr}bar.js 44ms`,
  ].join('\n')

  it('outputs the files that were formatted', () => {
    displayWriteOutput({ stdout })

    expect(logger.info).toHaveBeenCalledWith(
      'Prettier has formatted the following files for you:'
    )

    expect(logger.info).toHaveBeenCalledWith('- foo.js 44ms')
    expect(logger.info).toHaveBeenCalledWith('- bar.js 44ms')
  })
})
