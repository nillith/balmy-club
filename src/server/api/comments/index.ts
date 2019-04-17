
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {plusComment, unPlusComment} from "./controller";

const router = Router();

router.post('/:id/plus', asyncMiddleware(plusComment));
router.delete('/:id/plus', asyncMiddleware(unPlusComment));
export default router;
