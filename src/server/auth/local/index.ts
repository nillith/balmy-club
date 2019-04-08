import {Router} from 'express';
import passport from 'passport';
import {authService} from '../../service/auth';
import {Strategy as LocalStrategy} from 'passport-local';
import {UserModel} from "../../models/user-model";


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
          message: 'UserModel name or password is not correct!'
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
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    res.json({
      token: await authService.sign(user)
    });
  })(req, res, next);
});

export default router;
