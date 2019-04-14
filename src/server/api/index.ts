import {Router} from "express";
import users from './users';
import i from './i';
import posts from './posts';
import {requireAdmin, requireLogin} from "../service/auth.service";
import account from "./account";

const router = Router();

router.use('/account', account);
router.use('/users', requireAdmin, users);
router.use('/i', requireLogin, i);
router.use('/posts', requireLogin, posts);

export default router;
