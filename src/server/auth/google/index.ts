import passport from 'passport';
import config from '../../config';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import {OAuthModel, OAuthTypes} from "../../models/o-auth.model";

passport.use(new GoogleStrategy({
    clientID: config.auth.google.clientId,
    clientSecret: config.auth.google.clientSecret,
    callbackURL: "/auth/google/callback"
  },
  (token, tokenSecret, profile, done) => {
    return OAuthModel.authWithGoogle(profile, done);
  }));

const router = OAuthModel.createRouter(OAuthTypes.google);

export default router;
