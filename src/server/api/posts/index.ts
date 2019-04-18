
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {getPostById, getPublicStreamPosts, plusPost, publishNewPost, unPlusPost} from "./controller";

const router = Router();

router.post('/', asyncMiddleware(publishNewPost));
router.get('/discover', asyncMiddleware(getPublicStreamPosts));
router.get('/:id', asyncMiddleware(getPostById));
router.post('/:id/plus', asyncMiddleware(plusPost));
router.delete('/:id/plus', asyncMiddleware(unPlusPost));
export default router;
