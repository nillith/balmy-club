import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {changePassword} from "./controller";

const router = Router();

router.post('/password', asyncMiddleware(changePassword));

export default router;
