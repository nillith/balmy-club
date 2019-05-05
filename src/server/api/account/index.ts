import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {resetPassword, forgotPassword, signUp} from "./controller";
const router = Router();

router.post('/', asyncMiddleware(signUp));
router.post('/password', asyncMiddleware(resetPassword));
router.put('/password', asyncMiddleware(forgotPassword));

export default router;
