import {Router} from "express";
import {changeUserCircles, createCircle, getAllMyCircles, getCircleById, removeCircle} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getAllMyCircles));
router.get('/:id', asyncMiddleware(getCircleById));
router.post('/', asyncMiddleware(createCircle));
router.delete('/:id', asyncMiddleware(removeCircle));
router.patch('/', asyncMiddleware(changeUserCircles));
export default router;
