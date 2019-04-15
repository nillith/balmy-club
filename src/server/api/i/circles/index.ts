import {Router} from "express";
import {createCircle, removeCircle} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.post('/', asyncMiddleware(createCircle));
router.delete('/:id', asyncMiddleware(removeCircle));

export default router;
