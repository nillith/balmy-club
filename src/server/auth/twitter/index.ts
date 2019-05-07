import {Router} from 'express';
import passport from 'passport';
import config from '../../config';
import {Strategy as TwitterStrategy} from 'passport-twitter';
import {UserModel} from "../../models/user.model";
import {ACCESS_TOKEN_COOKIE_KEY} from "../../../shared/constants";

passport.use(new TwitterStrategy({
    consumerKey: config.auth.twitter.consumerKey,
    consumerSecret: config.auth.twitter.consumerSecret,
    callbackURL: '/auth/twitter/callback'
  },
  (token, tokenSecret, profile, done) => {
    UserModel.findUserByTwitterId(profile._json.id)
      .then((user) => {
        if (user) {
          return user;
        }
        return UserModel.signUpWithTwitter(profile);
      })
      .then((user) => {
        if (!user) {
          throw Error("should not get here");
        }
        done(null, user);
      })
      .catch(done);
  }));


const router = Router();

router.get('/', passport.authenticate('twitter', {
  failureRedirect: '/sign-up',
  session: false
}));

router.get('/callback', (req, res, next) => {
  passport.authenticate('twitter', {
    failureRedirect: '/sign-up',
    session: false
  }, async (err, user, info) => {
    res.cookie(ACCESS_TOKEN_COOKIE_KEY, await user.getToken());
    res.redirect('/');
  })(req, res, next);
});

export default router;
