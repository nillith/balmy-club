import {Router} from "express";
import {deleteCommentById, publishComment} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.post('/', asyncMiddleware(publishComment));
router.delete('/:id', asyncMiddleware(deleteCommentById));
export default router;
