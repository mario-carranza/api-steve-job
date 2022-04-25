import { getMaterias } from '../controllers/materias.controller';
import {Router} from 'express'

const router =  Router();

router.route('/')
    .get(getMaterias)



export default router