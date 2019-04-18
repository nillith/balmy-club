import {Router} from "express";
import {getNotifications, getUnreadCount, markNotificationAsRead, markNotificationAsUnread} from "./controller";
import {asyncMiddleware} from "../../../utils/index";

const router = Router();

router.get('/', asyncMiddleware(getNotifications));
router.get('/unread-count', asyncMiddleware(getUnreadCount));
router.post('/:id/read', asyncMiddleware(markNotificationAsRead));
router.delete('/:id/read', asyncMiddleware(markNotificationAsUnread));

export default router;
