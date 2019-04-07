import {Router} from "express";
import user from './user';
import i from './i';
import {requireAdmin, requireLogin} from "../service/auth";
import signUp from "./sign-up";

const router = Router();

router.use('/sign-up', signUp);
router.use('/users', requireAdmin, user);
router.use('/i', requireLogin, i);

export default router;
