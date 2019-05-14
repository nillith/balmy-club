const childProcess = require('child_process')
const pack = require('../package.json')
const {getCommitCount, getUpdatedVersion, getBuildTsContent} = require('./utils');

(async function () {
  const version = getUpdatedVersion(await getCommitCount())
  const dockerBuild = `sudo docker build . -t ${pack.name}:${version} -t ${pack.name}:latest`
  console.log(dockerBuild);
  const sub = childProcess.exec(dockerBuild)
  process.stdin.pipe(sub.stdin)
  sub.stdout.pipe(process.stdout)
  sub.stderr.pipe(process.stderr)
  sub.on('close', function (code) {
    process.exit(code)
  })
})()
