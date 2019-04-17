
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {getPublicStreamPosts, publishNewPost} from "./controller";

const router = Router();

router.post('/', asyncMiddleware(publishNewPost));

router.get('/discover', asyncMiddleware(getPublicStreamPosts));
export default router;
