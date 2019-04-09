import config from '../config';
import jwt from 'jsonwebtoken';
import {UserModel} from '../models/user.model';
import {NextFunction, Request, RequestHandler, Response} from "express";
import {asyncMiddleware, respondWith} from "../utils/index";
import {$status, $user} from "../constants/symbols";
import {accessTokenCookieKey, accessTokenKey, Roles, UserRanks} from "../../shared/constants";
import {AccessTokenContent} from "../../shared/interf";

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

export interface JwtSignable {
  getJwtPayload(): object;
}

export class JwtHelper<TPayload extends JwtSignable, TResult = TPayload> {
  constructor(private secret: string, private defaultExpire: string | number) {

  }

  async sign(payload: TPayload, expire?: string | number): Promise<string> {
    return new Promise((resolve, reject) => {
      return jwt.sign(payload.getJwtPayload(), this.secret, {
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

  async verify(token: string): Promise<TResult> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload as any as TResult);
        }
      });
    });
  }
}

export class AuthService extends JwtHelper<UserModel, AccessTokenContent> {

  async setTokenCookie(user: UserModel, res: Response) {
    res.cookie(accessTokenCookieKey, await this.sign(user));
  }

  async getRequestUser(req: Request): Promise<UserModel | undefined> {
    const token = getToken(req);
    if (!token) {
      return;
    }
    const payload = await this.verify(token);
    return UserModel.findById(payload.id!);
  }

  requireRole(requiredRole: string): RequestHandler {
    const self = this;
    const requiredRank = UserRanks[requiredRole];
    return asyncMiddleware(async function(req: Request, res: Response, next: NextFunction) {
      const user = await self.getRequestUser(req);
      if (user) {
        req[$user] = user;
        if (req[$user].role >= requiredRank) {
          return next();
        }
      }
      respondWith(res, 403);
    });
  }
}

export const authService = new AuthService(config.secrets.auth!, '5h');

export const requireAdmin = authService.requireRole(Roles.Admin);

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


export class SignUpPayload implements JwtSignable {
  constructor(readonly email: string) {
  }

  getJwtPayload(): object {
    return this;
  }
}


export const signUpService = new JwtHelper<SignUpPayload>(config.secrets.signUp!, '2d');
