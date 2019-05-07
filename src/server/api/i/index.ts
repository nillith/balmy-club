import {Router} from "express";
import {asyncMiddleware} from "../../utils/index";
import {changePassword, getHomeTimelinePosts, getProfile} from "./controller";
import settings from './settings';
import circles from './circles';
import notifications from './notifications';
import comments from './comments';
import posts from './posts';

const router = Router();

router.get('/', asyncMiddleware(getProfile));
router.put('/password', asyncMiddleware(changePassword));
router.use('/circles', circles);
router.use('/settings', settings);
router.use('/notifications', notifications);
router.use('/comments', comments);
router.use('/posts', posts);
router.get('/home-timeline', asyncMiddleware(getHomeTimelinePosts));
export default router;
