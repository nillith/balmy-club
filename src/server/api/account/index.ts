import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {changePassword, signUp} from "./controller";
const router = Router();

router.post('/', asyncMiddleware(signUp));
router.put('/password', asyncMiddleware(changePassword));

export default router;
