import {generateTextSecret, throwIfFalsy} from "../utils/index";
import {utcTimestamp} from "../../shared/utils";
import {DatabaseDriver, fromDatabaseRow} from "./model-base";
import {RawUser, throwIfInvalidRawUser, UserModel, UserRecord} from "./user.model";
import db from "../persistence/index";
import _ from 'lodash';
import passport from 'passport';
import {ACCESS_TOKEN_COOKIE_KEY} from "../../shared/constants";
import {Router} from "express";

export enum OAuthTypes {twitter = 'twitter', github = 'github', google = 'google'}

type ProfileToRawUser = (profile: any) => RawUser;

const getProfileToRawFun = (function() {
  const cache: {
    [index: string]: ProfileToRawUser
  } = {};

  function createRawUser(): RawUser {
    const result = {} as RawUser;
    result.username = generateTextSecret(20).substr(0, 24);
    result.password = generateTextSecret(96);
    result.createdAt = utcTimestamp();
    return result;
  }

  cache[OAuthTypes.twitter] = function(profile: any): RawUser {
    const json = profile._json;
    const result = createRawUser();
    result.twitterId = json.id;
    result.avatarUrl = json.profile_image_url_https;
    result.bannerUrl = json.profile_banner_url;
    result.nickname = json.name;
    throwIfInvalidRawUser(result);
    return result;
  };

  cache[OAuthTypes.github] = function(profile: any): RawUser {
    const json = profile._json;
    const result = createRawUser();
    result.githubId = json.id;
    result.avatarUrl = json.avatar_url;
    result.bannerUrl = json.profile_banner_url;
    result.nickname = json.login;
    throwIfInvalidRawUser(result);
    return result;
  };

  cache[OAuthTypes.google] = function(profile: any): RawUser {
    const json = profile._json;
    const result = createRawUser();
    result.googleId = json.sub;
    result.avatarUrl = json.picture;
    result.nickname = json.name;
    throwIfInvalidRawUser(result);
    return result;
  };

  return function(type: OAuthTypes): ProfileToRawUser {
    throwIfFalsy(cache[type], `No ProfileToRawUser for OAuth type: ${type}`);
    return cache[type];
  };

})();


type OAuthSignUpFunction = (profile: any, driver?: DatabaseDriver) => Promise<UserRecord>;
type OAuthFindUserFunction = (oAuthId: any, driver?: DatabaseDriver) => Promise<UserRecord | undefined>;
type OAuthFindOrCreateFunction = (profile: any, driver?: DatabaseDriver) => Promise<UserRecord>;

const getOAuthSignUpFunction = (function() {
  const funCache: any = {};
  for (let t in OAuthTypes) {
    const profileToRaw = getProfileToRawFun(t as any as OAuthTypes);
    funCache[t] = function(profile: any, driver: DatabaseDriver = db): Promise<UserRecord> {
      return UserModel.create(profileToRaw(profile), driver);
    };
  }
  return function(type: OAuthTypes): OAuthSignUpFunction {
    throwIfFalsy(funCache[type], `No OAuthSignUpFunction for OAuth type: ${type}`);
    return funCache[type];
  };
})();

const getOAuthFindFunction = (function() {
  const funCache: any = {};

  for (let t in OAuthTypes) {
    const findSql = `SELECT id, username, role FROM Users WHERE ${t}Id = :oAuthId LIMIT 1`;
    funCache[t] = async function(oAuthId: any, driver: DatabaseDriver = db): Promise<UserRecord | undefined> {
      const [rows] = await driver.query(findSql, {oAuthId});
      if (!_.isEmpty(rows)) {
        return fromDatabaseRow(rows[0], UserRecord);
      }
    };
  }

  return function(type: OAuthTypes): OAuthFindUserFunction {
    throwIfFalsy(funCache[type], `No OAuthFindUserFunction for OAuth type: ${type}`);
    return funCache[type];
  };
})();

const getOAuthFindOrCreateFunction = (function() {
  const funCache: any = {};
  for (let t in OAuthTypes) {
    const findFunction = getOAuthFindFunction(t as any as OAuthTypes);
    const signUpFunction = getOAuthSignUpFunction(t as any as OAuthTypes);
    funCache[t] = async function(profile: any, done: any, driver: DatabaseDriver = db): Promise<UserRecord> {
      const user = await findFunction(profile.id, driver);
      if (user) {
        return user;
      }
      return signUpFunction(profile, driver);
    };
  }

  return function(type: OAuthTypes): OAuthFindOrCreateFunction {
    throwIfFalsy(funCache[type], `No OAuthFindOrCreateFunction for OAuth type: ${type}`);
    return funCache[type];
  };
})();

function getOAuthFunction(type: OAuthTypes) {
  const findOrCreate = getOAuthFindOrCreateFunction(type);
  return function(profile: any, done: any, driver: DatabaseDriver = db) {
    return findOrCreate(profile, driver)
      .then((user) => {
        done(null, user);
      })
      .catch(done);
  };
}

export class OAuthModel {
  static readonly signUpWithTwitter = getOAuthSignUpFunction(OAuthTypes.twitter);
  static readonly findUserByTwitterId = getOAuthFindFunction(OAuthTypes.twitter);
  static readonly findOrSignUpWithTwitter = getOAuthFindOrCreateFunction(OAuthTypes.twitter);
  static readonly authWithTwitter = getOAuthFunction(OAuthTypes.twitter);

  static readonly signUpWithGithub = getOAuthSignUpFunction(OAuthTypes.github);
  static readonly findUserByGithubId = getOAuthFindFunction(OAuthTypes.github);
  static readonly findOrSignUpWithGithub = getOAuthFindOrCreateFunction(OAuthTypes.github);
  static readonly authWithGithub = getOAuthFunction(OAuthTypes.github);

  static readonly signUpWithGoogle = getOAuthSignUpFunction(OAuthTypes.google);
  static readonly findUserByGoogleId = getOAuthFindFunction(OAuthTypes.google);
  static readonly findOrSignUpWithGoogle = getOAuthFindOrCreateFunction(OAuthTypes.google);
  static readonly authWithGoogle = getOAuthFunction(OAuthTypes.google);

  static createRouter(type: OAuthTypes) {
    const getOptions: any = {
      failureRedirect: '/sign-up',
      session: false
    };
    if (type === OAuthTypes.google) {
      getOptions.scope = 'profile';
    }
    const router = Router();
    router.get('/', passport.authenticate(type as string, getOptions));

    router.get('/callback', (req, res, next) => {
      passport.authenticate(type as string, async (err, user, info) => {
        let redirectUrl = '/sign-up';
        if (user) {
          res.cookie(ACCESS_TOKEN_COOKIE_KEY, await user.getToken());
          redirectUrl = '/';
        }
        res.redirect(redirectUrl);
      })(req, res, next);
    });
    return router;
  }
}

