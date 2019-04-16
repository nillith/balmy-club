import './init';
import config from './config';
import http from 'http';
import app from './app';
import {UserModel} from "./models/user.model";
import {cloneFields} from "../shared/utils";
import {MENTION_PATTERN, SignUpTypes} from "../shared/constants";

import {DirectSignUpRequest} from "../shared/request_interface";

function createMentionRegexp() {
  return new RegExp(MENTION_PATTERN, 'g');
}


const blah: DirectSignUpRequest = {
  username: 'string',
  nickname: 'string',
  password: 'string',
  type: SignUpTypes.Direct,
};

console.log(blah);
const usr = new UserModel();

usr.id = 1;

const b = cloneFields(usr, ['name']);

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
