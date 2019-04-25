import {Router} from "express";
import {deletePost, createPost, editPost} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();
router.post('/', asyncMiddleware(createPost));
router.delete('/:id', asyncMiddleware(deletePost));
router.patch('/:id', asyncMiddleware(editPost));
export default router;
