import {Router} from "express";
import {changeUserCircles, createCircle, getAllMyCircles, getCircleById, removeCircle} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getAllMyCircles));
router.post('/', asyncMiddleware(createCircle));
router.patch('/user', asyncMiddleware(changeUserCircles));
router.get('/:id', asyncMiddleware(getCircleById));
router.delete('/:id', asyncMiddleware(removeCircle));
export default router;
