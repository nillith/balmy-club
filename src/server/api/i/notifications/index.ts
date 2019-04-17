import {Router} from "express";
import {getNotifications, getUnreadCount} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getNotifications));
router.get('/unread-count', asyncMiddleware(getUnreadCount));

export default router;
