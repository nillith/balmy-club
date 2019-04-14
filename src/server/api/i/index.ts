import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {changePassword, createCircle, removeCircle} from "./controller";

const router = Router();

router.put('/password', asyncMiddleware(changePassword));
router.post('/circles', asyncMiddleware(createCircle));
router.delete('/circles/:id', asyncMiddleware(removeCircle))


export default router;
