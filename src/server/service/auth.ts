import config from '../config';
import jwt from 'jsonwebtoken';
import {UserModel} from '../models/user';
import {NextFunction, Request, RequestHandler, Response} from "express";
import {constants} from "../constants/index";
import {asyncMiddleware, cloneFields, respondWith} from "../utils/index";
import {$status, $user} from "../constants/symbols";
import {accessTokenCookieKey, accessTokenKey} from "../../shared/constants";

const getToken = (() => {
  const Bearer = 'Bearer ';
  return (req: Request) => {
    if (req.headers && req.headers.authorization && (req.headers.authorization as string).startsWith(Bearer)) {
      return (req.headers.authorization as string).substring(Bearer.length);
    } else {
      return (req.query && req.query[accessTokenKey]) || req.cookies[accessTokenCookieKey];
    }
  };
})();


export class JwtHelper<TPayload> {
  constructor(private secret: string, private defaultExpire: string | number) {

  }

  async sign(payload: TPayload, expire?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      return jwt.sign(payload as any as object, this.secret, {
        expiresIn: expire || this.defaultExpire
      }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  async verify(token: string): Promise<TPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload as any as TPayload);
        }
      });
    });
  }
}

const keys = function(T: { new(): any }) {
  return Object.keys(new T());
};

export class AuthPayload {
  readonly id: string = 'dummy';
  readonly role: string = 'dummy';
}

const Auth_Payload_Keys = keys(AuthPayload);

export class AuthService extends JwtHelper<AuthPayload> {

  async sign(payload: AuthPayload): Promise<string> {
    return super.sign(cloneFields(payload, Auth_Payload_Keys));
  }

  async setTokenCookie(user: AuthPayload, res: Response) {
    res.cookie(accessTokenCookieKey, await this.sign(user));
  }

  async getRequestUser(req: Request): Promise<UserModel | undefined> {
    const token = getToken(req);
    if (!token) {
      return;
    }
    const payload = await this.verify(token);
    return UserModel.findById(payload.id);
  }

  requireRole(role): RequestHandler {
    const self = this;
    const {userRoleRanks} = constants;
    const requiredRoleRank = userRoleRanks[role];
    if (!requiredRoleRank) {
      throw new Error('Required role needs to be set');
    }
    return asyncMiddleware(async function(req: Request, res: Response, next: NextFunction) {
      const user = await self.getRequestUser(req);
      if (user) {
        req[$user] = user;
        const userRoleRank = userRoleRanks[req[$user].role];
        if (userRoleRank >= requiredRoleRank) {
          return next();
        }
      }
      respondWith(res, 403);
    });
  }
}

export const authService = new AuthService(config.secrets.auth!, '5h');

export const requireAdmin = authService.requireRole('admin');

export const requireLogin = asyncMiddleware(async function(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getRequestUser(req);
    if (!user) {
      return respondWith(res, 401);
    }
    req[$user] = user;
  } catch (e) {
    (e as any)[$status] = 401;
    next(e);
  }
});


export class SignUpPayload {
  readonly email = 'dummy';
}

const SignUp_Payload_Keys = keys(SignUpPayload);

export class SignUpService extends JwtHelper<SignUpPayload> {
  async sign(payload: SignUpPayload): Promise<string> {
    return super.sign(cloneFields(payload, SignUp_Payload_Keys));
  }
}

export const signUpService = new SignUpService(config.secrets.signUp!, '2d');
