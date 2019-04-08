import '../env';
import path from 'path';
function toNumber(envName: string) {
  return parseFloat(env[envName]!);
}

const root = path.normalize(`${__dirname}/../..`);
const publicRoot = path.normalize(`${root}/client`);
const {env} = process;
export const config = {
  root, publicRoot,
  env: env.NODE_ENV || 'development',
  isProd: 'production' === env.NODE_ENV,
  port: toNumber('SERVER_PORT') || 9000,
  ip: env.SERVER_IP || '127.0.0.1',
  host: env.SERVER_HOST,
  isBehindTrustProxy: 'true' === env.IS_BEHIND_TRUST_PROXY,
  secrets: {
    session: env.SESSION_SECRET,
    auth: env.AUTH_SECRET,
    signUp: env.SIGN_UP_SECRET,
    redis: {
      host: env.REDIS_HOST,
      port: toNumber('REDIS_PORT') || 6379,
      password: env.REDIS_PASSWORD
    },
    mysql: {
      host: env.MYSQL_HOST,
      port: toNumber('MYSQL_PORT') || 3306,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    },
    mailer: {
      host: env.MAILER_HOST,
      port: toNumber('MAILER_PORT'),
      secure: 'false' !== env.MAILER_ENABLE_SECURE,
      from: env.MAILER_FROM,
      user: env.MAILER_USER,
      password: env.MAILER_PASSWORD
    },
    obfuscator: {
      user: env.OBFUSCATOR_SECRET_USER,
      post: env.OBFUSCATOR_SECRET_POST,
      circle: env.OBFUSCATOR_SECRET_CIRCLE,
    }
  },
  password: {
    saltBytes: 32,
    keyBytes: 64,
    iterations: 10000,
    algorithm: 'sha256',
  }
};
export default config;
