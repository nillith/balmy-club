import {NextFunction, Request, Response} from "express";
import {SettingsData} from "../../../../shared/interf";
import {isValidEmailAddress, isValidNickname, isValidPassword, isValidUsername} from "../../../../shared/utils";
import {isValidURL, respondWith} from "../../../utils/index";
import {isString} from "util";
import {$user} from "../../../constants/symbols";
import _ from 'lodash';

export function getSettingsPayloadOrError(body: any) {
  const result: SettingsData = {};
  const {email, password, username, nickname, avatarUrl} = body;
  if (email && isValidEmailAddress(email)) {
    result.email = email;
  } else {
    return `invalid email`;
  }

  if (password && !isValidPassword(password)) {
    result.password = password;
  } else {
    return `invalid password`;
  }

  if (username && !isValidUsername(username)) {
    result.username = username;
  } else {
    return `invalid username`;
  }

  if (nickname && !isValidNickname(nickname)) {
    result.nickname = nickname;
  } else {
    return `invalid nickname`;
  }

  if (avatarUrl && !isValidURL(avatarUrl)) {
    result.avatarUrl = avatarUrl;
  } else {
    return `invalid avatar url`;
  }

  return result;
}

export const changeSettings = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getSettingsPayloadOrError(req.body);
  if (isString(payload)) {
    return respondWith(res, 400);
  }
  const user = req[$user];

  if (user && !_.isEmpty(payload)) {
    await user.saveSettings(payload);
  }
  return respondWith(res, 200);
};
