
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {publishNewPost} from "./controller";

const router = Router();

router.post('/', asyncMiddleware(publishNewPost));

export default router;
