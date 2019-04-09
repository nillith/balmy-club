import {Router} from "express";
import user from './users';
import i from './i';
import {requireAdmin, requireLogin} from "../service/auth.service";
import account from "./account";

const router = Router();

router.use('/account', account);
router.use('/users', requireAdmin, user);
router.use('/i', requireLogin, i);

export default router;
