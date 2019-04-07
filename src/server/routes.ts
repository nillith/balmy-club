import {Express} from "express";
import auth from './auth';
import api from './api';
import * as path from "path";
import config from "./config/index";
import {respondErrorPage} from "./utils/index";

export default function(app: Express) {
  app.use('/auth', auth);
  app.use('/api', api);

  app.route('/:url(api|auth)/*')
    .get((req, res) => {
      respondErrorPage(res, 404);
    });

  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${config.publicRoot}/index.html`));
    });
}
