import {NextFunction, Request, Response} from "express";
import {SettingsData} from "../../../../shared/interf";
import {isValidEmailAddress, isValidNickname, isValidPassword, isValidUsername} from "../../../../shared/utils";
import {isValidURL, respondWith, trimFields} from "../../../utils/index";
import {isString} from "util";
import {$user} from "../../../constants/symbols";
import _ from 'lodash';

export function getSettingsPayloadOrError(body: any) {
  trimFields(body);
  let {email, password, username, nickname, avatarUrl} = body;

  if (email && !isValidEmailAddress(email)) {
    return `invalid email`;
  }

  if (password && !isValidPassword(password)) {
    return `invalid password`;
  }

  if (username && !isValidUsername(username)) {
    return `invalid username`;
  }

  if (nickname && !isValidNickname(nickname)) {
    return `invalid nickname`;
  }

  if (avatarUrl && !isValidURL(avatarUrl)) {
    return `invalid avatar url`;
  }

  return {email, password, username, nickname, avatarUrl};
}

export const changeSettings = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getSettingsPayloadOrError(req.body);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }
  const user = req[$user];

  if (user && !_.isEmpty(payload)) {
    await user.saveSettings(payload);
  }
  return respondWith(res, 200);
};
