import './init';
import config from './config';
import http from 'http';
import app from './app';


http
  .createServer(app)
  .listen(config.port, config.ip, () => {
    console.log(`Express server listening on ${config.ip}:${config.port}, in ${config.env} mode!`);

  });
