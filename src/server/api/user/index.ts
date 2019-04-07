import {createUser} from "./controller";
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";

const router = Router();

router.post('/', asyncMiddleware(createUser));

export default router;
