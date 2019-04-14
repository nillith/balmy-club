import './init';
import config from './config';
import http from 'http';
import app from './app';
function createMentionRegexp() {
  return new RegExp(MENTION_PATTERN, 'g');
}


import {db} from './persistence';
import {UserModel} from "./models/user.model";
import {NotificationModel} from "./models/notification.model";
import {utcTimestamp} from "../shared/utils";
import {TextContentModel} from "./models/text-content.model";
import {MENTION_PATTERN} from "../shared/constants";

const usr = new UserModel();

usr.id = 1;


(async () => {
 //  const t = new TextContentModel();
  //  t.content = content;
  //  console.log(t.extractMentionsFromContent());
  // // const con = await db.getConnection();
  //  //await NotificationModel.bulkInsertIntoDatabase(con, [1, 2, 3, 4], 3, utcTimestamp());
  // content.replace(createMentionRegexp(), (str: string, ...rest: any[]) => {
  //   console.log([str, ...rest]);
  //   return '';
  // });
})();

http
  .createServer(app)
  .listen(config.port, config.ip, () => {
    console.log(`Express server listening on ${config.port}, in ${config.env} mode!`);

  });
