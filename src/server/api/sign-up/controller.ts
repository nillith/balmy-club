import {NextFunction, Request, Response} from "express";
import {respondWith} from "../../utils/index";
import mailService from "../../service/mailer";
import validator from 'validator';
import {AuthPayload, authService, signUpService} from "../../service/auth";
import {isValidPassword, isValidUsername, UserCreateInfo, UserModel} from "../../models/user";

const getSignUpInfo = async function(body: any): Promise<UserCreateInfo | undefined> {
  const {username, password} = body;
  if (!isValidPassword(password) || !isValidUsername(username)) {
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
    if (!signUpInfo) {
      return respondWith(res, 400);
    }
    const user = await UserModel.create(signUpInfo);
    return respondWith(res, 200, await authService.sign(user as AuthPayload));
  } else {
    const email = body.email && body.email.trim();
    if (!email || !validator.isEmail(email) || await UserModel.emailUsed(email)) {
      return respondWith(res, 400);
    }
    await mailService.sendSignUpMail({email});
    respondWith(res, 200);
  }
};
