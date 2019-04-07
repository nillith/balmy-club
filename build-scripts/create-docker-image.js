const childProcess = require('child_process');
const pack = require('../package.json')

const dockerBuild = `docker build . -t ${pack.name}:${pack.version} -t ${pack.name}:latest`;
const sub = childProcess.exec(dockerBuild);
process.stdin.pipe(sub.stdin);
sub.stdout.pipe(process.stdout);
sub.stderr.pipe(process.stderr);
