import passport from 'passport';
import config from '../../config';
import {Strategy as TwitterStrategy} from 'passport-twitter';
import {OAuthModel, OAuthTypes} from "../../models/o-auth.model";

passport.use(new TwitterStrategy({
    consumerKey: config.auth.twitter.consumerKey,
    consumerSecret: config.auth.twitter.consumerSecret,
    callbackURL: '/auth/twitter/callback'
  },
  (token, tokenSecret, profile, done) => {
    return OAuthModel.authWithTwitter(profile, done);
  }));

const router = OAuthModel.createRouter(OAuthTypes.twitter);

export default router;
