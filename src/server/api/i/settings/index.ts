import {Router} from "express";
import {changeSettings} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.patch('/', asyncMiddleware(changeSettings));


export default router;
