import {Router} from "express";
import {publishComment} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.post('/', asyncMiddleware(publishComment));
export default router;
