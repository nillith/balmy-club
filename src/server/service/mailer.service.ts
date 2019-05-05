import nodeMailer from 'nodemailer';
import config from '../config';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail, {Address} from "nodemailer/lib/mailer";
import {RecoverPasswordPayload, recoverPasswordService, SignUpPayload, signUpService} from "./auth.service";
import {SignUpTypes} from "../../shared/contracts";
import {PagePaths} from "../../shared/constants";
import {ActionTicket, assertValidActionTicket} from "../models/user.model";
import {devOnly} from "../utils/index";
import {isValidEmailAddress} from "../../shared/utils";

const mailerSecrets = config.secrets.mailer;
const mailerOptions = {
  host: mailerSecrets.host,
  port: mailerSecrets.port,
  from: mailerSecrets.from,
  secure: mailerSecrets.secure,
  auth: {
    user: mailerSecrets.user,
    pass: mailerSecrets.password
  }
};

const makeSignUpLink = (function() {
  const secure = config.isProd ? 's' : '';
  return async function(payload: SignUpPayload) {
    return `http${secure}://${config.host}/${PagePaths.SignUp}?token=${await signUpService.sign(payload)}`;
  };
})();

const makeResetPasswordLink = (function() {
  const secure = config.isProd ? 's' : '';
  return async function(actionTicket: ActionTicket) {
    return `http${secure}://${config.host}/${PagePaths.ResetPassword}?token=${await recoverPasswordService.sign(new RecoverPasswordPayload(actionTicket))}`;
  };
})();


const assertValidResetPasswordParams = devOnly(function(arg1: any, arg2: any) {
  console.assert(isValidEmailAddress(arg1), `invalid email: ${arg1}`);
  assertValidActionTicket(arg2);
});

class MailService {
  private readonly mailer: Mail;
  private readonly from: string | Address | undefined;

  constructor(options: SMTPTransport.Options) {
    this.mailer = nodeMailer.createTransport(options);
    this.from = options.from;
  }

  async sendMail(mail: Mail.Options) {
    mail.from = this.from;
    return this.mailer.sendMail(mail);
  }

  async sendSignUpMail(payload: SignUpPayload) {
    payload.type = SignUpTypes.Email;
    const signUpLink = await makeSignUpLink(payload);
    return this.sendMail({
      to: payload.email,
      subject: 'Sign Up',
      text: `click ${signUpLink}`,
      html: `<p><a href="${signUpLink}">Sign Up</a></p>`
    });
  }

  async sendResetPasswordMail(email: string, actionTicket: ActionTicket) {
    assertValidResetPasswordParams(email, actionTicket);
    const resetPasswordLink = await makeResetPasswordLink(actionTicket);
    return this.sendMail({
      to: email,
      subject: 'Reset Password',
      text: `click ${resetPasswordLink}`,
      html: `<p><a href="${resetPasswordLink}">Reset Password</a></p>`
    });
  }
}

export const mailService = new MailService(mailerOptions as SMTPTransport.Options);

export default mailService;
