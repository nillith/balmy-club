const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')
const {getCommitCount, getUpdatedVersion, getBuildTsContent} = require('./utils')
const ROOT = path.normalize(`${__dirname}/..`)
const PACKAGE_PATH = `${ROOT}/package.json`
const BUILD_TS = `${ROOT}/src/shared/build.ts`;

(async function () {
  const commitCount = await getCommitCount()
  const patch = 'precommit' === process.argv[2] ? commitCount + 1 : commitCount
  pkg.version = await getUpdatedVersion(patch)
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2), 'utf8')
  fs.writeFileSync(BUILD_TS, getBuildTsContent(pkg.version), 'utf8')
})()
