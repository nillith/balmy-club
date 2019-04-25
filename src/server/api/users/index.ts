import {createUser, getUserById, getUserStreamPosts} from "./controller";
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {requireAdmin, requireLogin} from "../../service/auth.service";

const router = Router();

router.get('/:id', requireLogin, asyncMiddleware(getUserById));
router.get('/:id/posts', requireLogin, asyncMiddleware(getUserStreamPosts));
router.post('/', requireAdmin, asyncMiddleware(createUser));

export default router;
