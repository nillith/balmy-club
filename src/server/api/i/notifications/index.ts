import {Router} from "express";
import {getNotification} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getNotification));

export default router;
