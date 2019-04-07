import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {signUp} from "./controller";
const router = Router();

router.post('/', asyncMiddleware(signUp));

export default router;
