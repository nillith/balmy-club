import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import mailService from "../../service/mailer.service";
import validator from 'validator';
import {authService, SignUpPayload, signUpService} from "../../service/auth.service";
import {passwordFormatIsValid, UserCreateInfo, UserModel, usernameFormatIsValid} from "../../models/user.model";

const getSignUpInfo = async function(body: any): Promise<UserCreateInfo | undefined> {
  const {username, password} = body;
  if (!passwordFormatIsValid(password) || !usernameFormatIsValid(username)) {
    return;
  }
  const payload = await signUpService.verify(body.token);
  const {email} = payload;
  if (await UserModel.emailUsed(email)) {
    return;
  }
  return {email, username, password};
};

export const signUp = async function(req: Request, res: Response, next: NextFunction) {
  const {body} = req;
  if (body.token) {
    const signUpInfo = await getSignUpInfo(body);
    if (signUpInfo) {
      const user = await UserModel.create(signUpInfo);
      if (user) {
        return respondWith(res, 200, await authService.sign(user));
      }
    }
    return respondWith(res, 400);

  } else {
    const email = body.email && body.email.trim();
    if (!email || !validator.isEmail(email) || await UserModel.emailUsed(email)) {
      return respondWith(res, 400);
    }
    await mailService.sendSignUpMail(new SignUpPayload(email));
    respondWith(res, 200);
  }
};
