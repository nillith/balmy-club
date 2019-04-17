import {Router} from "express";
import users from './users';
import i from './i';
import posts from './posts';
import comments from './comments';
import {requireAdmin, requireLogin} from "../service/auth.service";
import account from "./account";
import admin from "./admin";

const router = Router();

router.use('/account', account);
router.use('/users', requireLogin, users);
router.use('/i', requireLogin, i);
router.use('/posts', requireLogin, posts);
router.use('/comments', requireLogin, comments);
router.use('/admin', requireAdmin, admin);

export default router;
