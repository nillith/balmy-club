import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import mailService from "../../service/mailer.service";
import validator from 'validator';
import {authService, SignUpPayload, signUpService} from "../../service/auth.service";
import {passwordFormatIsValid, UserCreateInfo, UserModel, usernameFormatIsValid} from "../../models/user.model";
import {AuthPayload, SignUpTypes} from "../../../shared/interf";
import {isString} from "util";

const SignUpErrorMessages = {
  invalidEmail: 'Invalid Email!',
  emailUsed: 'Email Already Used!',
  invalidPassword: 'Invalid Password!',
  invalidUsername: 'Invalid Username!',
  unknownType: 'Unknown type!',
  noToken: 'Token Required!',
};

const getSignUpInfo = async function(body: AuthPayload): Promise<UserCreateInfo | string> {
  let email, username, password;
  switch (body.type) {
    case SignUpTypes.Request:
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
        const payload = await signUpService.verify(body.token);
        ({email} = payload);
        console.assert(email);
        console.assert(validator.isEmail(email));
      } catch (e) {
        return e.message();
      }
      break;
    case SignUpTypes.Direct:
      ({username, password} = body);
      if (!passwordFormatIsValid(password)) {
        return SignUpErrorMessages.invalidPassword;
      }
      if (!usernameFormatIsValid(username)) {
        return SignUpErrorMessages.invalidUsername;
      }
      break;
    default:
      return SignUpErrorMessages.unknownType;
  }

  if (email && await UserModel.emailUsed(email)) {
    return SignUpErrorMessages.emailUsed;
  }

  return {email, username, password};
};

export const signUp = async function(req: Request, res: Response, next: NextFunction) {
  const body: AuthPayload = req.body;
  const signUpInfo = await getSignUpInfo(body) as UserCreateInfo;
  if (isString(signUpInfo)) {
    return respondWith(res, 400, signUpInfo);
  }
  switch (body.type) {
    case SignUpTypes.Request:
      await mailService.sendSignUpMail(new SignUpPayload(signUpInfo.email));
      break;
    case SignUpTypes.WithToken: // fallthrough
    case SignUpTypes.Direct:
      const user = await UserModel.create(signUpInfo);
      if (user) {
        return respondWith(res, 200, await authService.sign(user));
      }
      break;
    default:
      console.assert(!'Should not get here!');
  }
  return respondWith(res, 400);
};

export const changePassword = async function(req: Request, res: Response, next: NextFunction) {
  respondWith(res, 200);
};

