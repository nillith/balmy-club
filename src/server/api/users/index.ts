import {createUser, getUserById} from "./controller";
import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";

const router = Router();

router.get('/:id', asyncMiddleware(getUserById));
router.post('/', asyncMiddleware(createUser));

export default router;
