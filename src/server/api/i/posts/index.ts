import {Router} from "express";
import {deletePostById, publishNewPost} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();
router.post('/', asyncMiddleware(publishNewPost));
router.delete('/:id', asyncMiddleware(deletePostById));
export default router;
