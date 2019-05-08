import passport from 'passport';
import config from '../../config';
import {Strategy as GitHubStrategy} from 'passport-github2';
import {OAuthModel, OAuthTypes} from "../../models/o-auth.model";

passport.use(new GitHubStrategy({
    clientID: config.auth.github.clientId,
    clientSecret: config.auth.github.clientSecret,
    callbackURL: "/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return OAuthModel.authWithGithub(profile, done);
  }));

const router = OAuthModel.createRouter(OAuthTypes.github);

export default router;
