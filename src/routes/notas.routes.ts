import { insertNotas,getNotas, getNotasByAlumno } from '../controllers/notas.controller';
import {Router} from 'express';
import { verifyRol } from '../middlewares/rolValidation'
import { validate } from "../middlewares/validation";



const router = Router()

router.get('/', verifyRol, getNotas)
router.get('/:alumno', verifyRol, getNotasByAlumno)
router.post('/', verifyRol, insertNotas)
router.put('/:id', verifyRol)

export default router