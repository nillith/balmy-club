import {Router} from "express";
import {changeUserCircles, createCircle, getAllMyCircles, removeCircle} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getAllMyCircles));
router.post('/', asyncMiddleware(createCircle));
router.delete('/:id', asyncMiddleware(removeCircle));
router.patch('/', asyncMiddleware(changeUserCircles));
export default router;
