import {Router} from 'express';
import local from './local';
import twitter from './twitter';
import github from './github';
import google from './google';

const router = Router();

router.use('/local', local);
router.use('/twitter', twitter);
router.use('/github', github);
router.use('/google', google);

export default router;

