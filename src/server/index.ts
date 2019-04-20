import './init';
import config from './config';
import http from 'http';
import app from './app';
import _ from 'lodash';
import db from './persistence';
import redisClient from './cache/redis';
import {messengerService} from "./service/messenger.service";

const server = http.createServer(app);
const shutdown = _.once(() => {
  console.log('shutdown');
  server.close(() => {
    messengerService.close(async () => {
      redisClient.quit();
      await db.end();
      process.exit();
    });
  });
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
server.listen(config.port, config.ip, () => {
  console.log(`Express server listening on ${config.ip}:${config.port}, in ${config.env} mode!`);
});



