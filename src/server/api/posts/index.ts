
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {getPostById, getPublicStreamPosts, plusPost, unPlusPost} from "./controller";

const router = Router();

router.get('/discover', asyncMiddleware(getPublicStreamPosts));
router.get('/:id', asyncMiddleware(getPostById));
router.post('/:id/plus', asyncMiddleware(plusPost));
router.delete('/:id/plus', asyncMiddleware(unPlusPost));
export default router;
