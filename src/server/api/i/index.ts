import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {changePassword} from "./controller";
import settings from './settings';
import circles from './circles';
import notifications from './notifications';

const router = Router();

router.put('/password', asyncMiddleware(changePassword));
router.use('/circles', circles);
router.use('/settings', settings);
router.use('/notifications', notifications);

export default router;
