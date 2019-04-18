import {NextFunction, Request, Response} from "express";
import {isValidEmailAddress, isValidNickname, isValidPassword, isValidUsername} from "../../../../shared/utils";
import {isValidURL, respondWith, trimFields} from "../../../utils/index";
import {isString} from "util";
import _ from 'lodash';
import {getRequestUser} from "../../../service/auth.service";

export function getSettingsPayloadOrError(body: any) {
  trimFields(body);
  let {email, password, username, nickname, avatarUrl, bannerUrl} = body;

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

  if (avatarUrl && !isValidURL(bannerUrl)) {
    return `invalid banner url`;
  }

  return {email, password, username, nickname, avatarUrl, bannerUrl};
}

export const changeSettings = async function(req: Request, res: Response, next: NextFunction) {
  const payload = getSettingsPayloadOrError(req.body);
  if (isString(payload)) {
    return respondWith(res, 400, payload);
  }
  const user = getRequestUser(req);

  if (user && !_.isEmpty(payload)) {
    await user.saveSettings(payload);
  }
  return respondWith(res, 200);
};
