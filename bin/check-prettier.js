#!/usr/bin/env node

const { argv } = require('yargs')

const { checkDependencyInstalledLocally } = require('../index')

const { error } = require('../log')

console.log('argv', argv)

const usePrettierEslint = argv['prettier-eslint'] === true

const targets = argv._

const prettierExists = checkDependencyInstalledLocally('prettier')

if (!prettierExists) {
  error('Could not find Prettier as a local dependency')
}

if (usePrettierEslint && !checkDependencyInstalledLocally('prettier-eslint')) {
  error('Could not find prettier-eslint as a local dependency')
}
