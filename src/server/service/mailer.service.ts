import nodeMailer from 'nodemailer';
import config from '../config';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail, {Address} from "nodemailer/lib/mailer";
import {SignUpPayload, signUpService} from "./auth.service";

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
    return `http${secure}://${mailerSecrets.host}/sign-up?token=${await signUpService.sign(payload)}`;
  };
})();

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
    const signUpLink = await makeSignUpLink(payload);
    return this.sendMail({
      to: payload.email,
      subject: 'Sign Up',
      text: `click ${signUpLink}`,
      html: `<p><a href="${signUpLink}">Sign Up</a></p>`
    });
  }
}

export const mailService = new MailService(mailerOptions as SMTPTransport.Options);

export default mailService;
