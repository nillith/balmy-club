import {Router} from "express";
import {deleteComment, editComment, createComment} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.post('/', asyncMiddleware(createComment));
router.delete('/:id', asyncMiddleware(deleteComment));
router.patch('/:id', asyncMiddleware(editComment));
export default router;
