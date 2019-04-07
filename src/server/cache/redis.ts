import redis from 'redis';
import bluebird from 'bluebird';
import config from "../config";
bluebird.promisifyAll(redis);

export const redisClient = redis.createClient(config.secrets.redis);
export default redisClient;
