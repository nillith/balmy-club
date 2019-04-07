import {Router} from 'express';
import local from './local';

const router = Router();

router.use('/local', local);

export default router;

