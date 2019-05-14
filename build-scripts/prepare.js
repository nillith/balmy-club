const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const pkg = require('../package.json')
const {getBuildTsContent} = require('./utils')

const ROOT = path.normalize(`${__dirname}/..`)
const CLIENT_ENV_DIR = `${ROOT}/src/client/environments`
const CLIENT_ENV_EXAMPLE = `${CLIENT_ENV_DIR}/example.environment.ts`
const CLIENT_ENV = `${CLIENT_ENV_DIR}/environment.ts`
const CLIENT_ENV_PROD = `${CLIENT_ENV_DIR}/environment.prod.ts`
const SERVER_ENV_DIR = `${ROOT}/src/server/env`
const SERVER_ENV_EXAMPLE = `${SERVER_ENV_DIR}/example.env`
const SERVER_ENV = `${SERVER_ENV_DIR}/.env`
const BUILD_TS = `${ROOT}/src/shared/build.ts`

function generateTextSecret () {
  return crypto.randomBytes(96).toString('base64').replace(/\//g, '').replace(/\+/g, '').replace(/=/g, '')
}

function generateHexSecret () {
  return crypto.randomBytes(32).toString('hex')
}

const SECRET_NAME_LIST = [
  'AUTH_SECRET',
  'SIGN_UP_SECRET',
  'SESSION_SECRET',
  'RECOVER_PASSWORD_SECRET',
]

const OBFUSCATOR_SECRET_NAME_LIST = [
  'OBFUSCATOR_SECRET_USER',
  'OBFUSCATOR_SECRET_POST',
  'OBFUSCATOR_SECRET_CIRCLE',
  'OBFUSCATOR_SECRET_COMMENT',
  'OBFUSCATOR_SECRET_NOTIFICATION',
]

if (!fs.existsSync(CLIENT_ENV)) {
  fs.copyFileSync(CLIENT_ENV_EXAMPLE, CLIENT_ENV)
}

if (!fs.existsSync(CLIENT_ENV_PROD)) {
  fs.copyFileSync(CLIENT_ENV_EXAMPLE, CLIENT_ENV_PROD)
}

if (!fs.existsSync(SERVER_ENV)) {
  let example = fs.readFileSync(SERVER_ENV_EXAMPLE, 'utf8')
  example = example.replace('NODE_ENV=', 'NODE_ENV=development')
  for (const name of SECRET_NAME_LIST) {
    example = example.replace(`${name}=`, `${name}=${generateTextSecret()}`)
  }

  for (const name of OBFUSCATOR_SECRET_NAME_LIST) {
    example = example.replace(`${name}=`, `${name}=${generateHexSecret()}`)
  }
  fs.writeFileSync(SERVER_ENV, example, 'utf8')
}

fs.writeFileSync(BUILD_TS, getBuildTsContent(pkg.version), 'utf8')
