import {createUser, getUserById, getUserStreamPosts} from "./controller";
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";

const router = Router();

router.get('/:id', asyncMiddleware(getUserById));
router.get('/:id/posts', asyncMiddleware(getUserStreamPosts));
router.post('/', asyncMiddleware(createUser));

export default router;
