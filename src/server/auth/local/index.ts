import {Router} from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {UserModel} from "../../models/user.model";
import {returnThis} from "../../../shared/utils";
import {respondWithJson} from "../../init";


passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password' // this is the virtual field on the model
}, (email, password, done) => {
  UserModel.authenticate(email, password)
    .then((user) => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Username or password is not correct!'
        });
      }
    })
    .catch(err => done(err));
}));


const router = Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    const error = err || info;
    if (error) {

      error.getOutboundData = returnThis;
      respondWithJson(res, error, 401);
    }
    if (!user) {
      const userNotFound: any = {message: 'Something went wrong, please try again.'};
      userNotFound.getOutboundData = returnThis;
      respondWithJson(res, userNotFound, 404);
    }
    respondWithJson(res, await user.getLoginData(req.body.rememberMe ? '2w' : undefined));
  })(req, res, next);
});

export default router;
