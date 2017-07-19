jest.mock('loglevel-colored-level-prefix', () => {
  return () => ({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  })
})

const executablesModule = require('./executables')

const invariantModule = require('./invariant')
const utilsModule = require('./util')
const logger = require('./log')

describe('prepareCommand', () => {
  beforeEach(() => {
    jest
      .spyOn(executablesModule, 'getExecutable')
      .mockImplementation(x => `node_modules/.bin/${x}`)

    jest.spyOn(invariantModule, 'invariant')
    jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  describe('invariants', () => {
    beforeEach(() => {
      jest
        .spyOn(utilsModule, 'execShellCommand')
        .mockImplementation(() => ({ stdout: '', code: 0 }))
    })

    test('if prettier is not installed it errors', () => {
      jest
        .spyOn(executablesModule, 'checkDependencyInstalledLocally')
        .mockImplementation(() => false)
      require('./prepare-command').prepareCommand({})
      expect(invariantModule.invariant).toHaveBeenCalledWith(
        false,
        'Could not find prettier as a local dependency.'
      )
    })

    test('if prettier-eslint is required but not installed it errors', () => {
      jest
        .spyOn(executablesModule, 'checkDependencyInstalledLocally')
        .mockImplementation(arg => arg === 'prettier')

      require('./prepare-command').prepareCommand({ usePrettierEslint: true })
      expect(invariantModule.invariant).toHaveBeenCalledWith(
        false,
        'Could not find prettier-eslint as a local dependency.'
      )
    })

    test('if you pass both --changed and --targets it errors', () => {
      jest
        .spyOn(executablesModule, 'checkDependencyInstalledLocally')
        .mockImplementation(() => true)

      require('./prepare-command').prepareCommand({
        changed: true,
        targets: 'src/*.js',
      })

      expect(invariantModule.invariant).toHaveBeenCalledWith(
        false,
        'You passed --changed and a list of files. You may only pass one or the other.'
      )
    })
  })

  describe('running against targets', () => {
    beforeEach(() => {
      jest
        .spyOn(executablesModule, 'checkDependencyInstalledLocally')
        .mockImplementation(() => true)
    })

    test('it passes the targets through to prettier', () => {
      jest
        .spyOn(utilsModule, 'execShellCommand')
        .mockImplementation(() => ({ stdout: 'foo.js bar.js', code: 0 }))

      const { command } = require('./prepare-command').prepareCommand({
        targets: 'src/*.js',
      })

      expect(command).toEqual(
        `node_modules/.bin/prettier --list-different 'src/*.js'`
      )
    })

    test('when write is set to true it writes the files', () => {
      jest
        .spyOn(utilsModule, 'execShellCommand')
        .mockImplementation(() => ({ stdout: 'foo.js bar.js', code: 0 }))

      const { command } = require('./prepare-command').prepareCommand({
        targets: 'src/*.js',
        write: true,
      })

      expect(command).toEqual(`node_modules/.bin/prettier --write 'src/*.js'`)
    })
  })

  describe('running against changed files', () => {
    beforeEach(() => {
      jest
        .spyOn(executablesModule, 'checkDependencyInstalledLocally')
        .mockImplementation(() => true)
    })

    test('when there are no changed files it errors', () => {
      jest
        .spyOn(utilsModule, 'execShellCommand')
        .mockImplementation(() => ({ stdout: '', code: 0 }))

      require('./prepare-command').prepareCommand({
        changed: true,
        targets: '',
      })

      expect(logger.error).toHaveBeenCalledWith(
        'No files were found to be changed, aborting.'
      )
    })

    test('when there are changed files it passes them to prettier', () => {
      jest
        .spyOn(utilsModule, 'execShellCommand')
        .mockImplementation(() => ({ stdout: 'foo.js bar.js', code: 0 }))

      const {
        command,
        changedGitFileNames,
      } = require('./prepare-command').prepareCommand({
        changed: true,
        targets: '',
      })

      expect(command).toEqual(
        'node_modules/.bin/prettier --list-different foo.js bar.js'
      )

      expect(changedGitFileNames).toEqual('foo.js bar.js')
    })
  })
})
