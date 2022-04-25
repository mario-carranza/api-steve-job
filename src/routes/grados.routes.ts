import { getGrados } from '../controllers/grados.controller';
import {Router} from 'express'

const router =  Router();

router.route('/')
    .get(getGrados)



export default router
