import {Router} from 'express';
import local from './local';
import twitter from './twitter';

const router = Router();

router.use('/local', local);
router.use('/twitter', twitter);

export default router;

