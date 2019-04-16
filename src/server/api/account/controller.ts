import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import mailService from "../../service/mailer.service";
import validator from 'validator';
import {SignUpPayload, signUpService} from "../../service/auth.service";
import {UserCreateInfo, UserModel} from "../../models/user.model";
import {isString} from "util";
import {isValidNickname, isValidPassword, isValidUsername} from "../../../shared/utils";
import _ from "lodash";
import {respondWithJson} from "../../init";
import {SignUpTypes} from "../../../shared/constants";
import {SignUpRequest} from "../../../shared/request_interface";

const SignUpErrorMessages = {
  invalidEmail: 'Invalid Email!',
  emailUsed: 'Email Already Used!',
  invalidPassword: 'Invalid Password!',
  invalidUsername: 'Invalid Username!',
  usernameTaken: 'Username already taken!',
  invalidNickname: 'Invalid Nickname!',
  unknownType: 'Unknown type!',
  noToken: 'Token Required!',
};


const getSignUpInfo = async function(body: SignUpRequest): Promise<UserCreateInfo | string> {
  let {email, username, password, nickname} = body as any;
  email = _.trim(email);
  username = _.trim(username);
  password = _.trim(password);
  nickname = _.trim(nickname);

  switch (body.type) {
    case SignUpTypes.Email:
      email = body.email && body.email.trim();
      if (!email || !validator.isEmail(email)) {
        return SignUpErrorMessages.invalidEmail;
      }
      break;
    case SignUpTypes.WithToken:
      try {
        if (!body.token) {
          return SignUpErrorMessages.noToken;
        }
        ({nickname} = body);
        if (!isValidNickname(nickname)) {
          return SignUpErrorMessages.invalidNickname;
        }
        const payload = await signUpService.verify(body.token);
        ({email} = payload);
        console.assert(email);
        console.assert(validator.isEmail(email));
      } catch (e) {
        return e.message();
      }
      break;
    case SignUpTypes.Direct:
      ({username, password, nickname} = body);
      if (!isValidPassword(password)) {
        return SignUpErrorMessages.invalidPassword;
      }
      if (!isValidUsername(username)) {
        return SignUpErrorMessages.invalidUsername;
      }
      if (!isValidNickname(nickname)) {
        return SignUpErrorMessages.invalidNickname;
      }
      break;
    default:
      return SignUpErrorMessages.unknownType;
  }

  if (email && await UserModel.emailExistsInDatabase(email)) {
    return SignUpErrorMessages.emailUsed;
  }

  if (username && await UserModel.usernameExistsInDatabase(username)) {
    return SignUpErrorMessages.usernameTaken;
  }

  return {email, username, password, nickname};
};

export const signUp = async function(req: Request, res: Response, next: NextFunction) {
  const body: SignUpRequest = req.body;
  const signUpInfo = await getSignUpInfo(body) as UserCreateInfo;
  if (isString(signUpInfo)) {
    return respondWith(res, 400, signUpInfo);
  }
  switch (body.type) {
    case SignUpTypes.Email:
      await mailService.sendSignUpMail(new SignUpPayload(signUpInfo.email!));
      break;
    case SignUpTypes.WithToken: // fallthrough
    case SignUpTypes.Direct:
      const user = await UserModel.create(signUpInfo);
      if (user) {
        return respondWithJson(res, await user.getLoginData());
      }
      break;
    default:
      console.assert(!'Should not get here!');
  }
  return respondWith(res, 400);
};

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 405);
};

