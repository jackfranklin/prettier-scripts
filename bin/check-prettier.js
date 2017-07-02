#!/usr/bin/env node

const { argv } = require('yargs')

const {
  checkDependencyInstalledLocally
} = require('../index')

console.log('argv', argv)

const usePrettierEslint = argv['prettier-eslint'] === true

const targets = argv._

const prettierExists = checkDependencyInstalledLocally('prettier')
console.log(prettierExists)
