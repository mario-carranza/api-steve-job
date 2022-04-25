import { getDocenteByGrado, getDocenteById, getDocenteByMateria, getDocentes, postDocente, updateDocente } from '../controllers/docente.controller';
import {Router} from 'express'
import { verifyRol } from '../middlewares/rolValidation';

const router  = Router()

router.get('/', verifyRol, getDocentes )
router.get('/:id', verifyRol, getDocenteById )
//router.get('/:materia', verifyRol, getDocenteByMateria )
//router.get('/:grado', verifyRol, getDocenteByGrado )
router.post('/', verifyRol, postDocente )
router.put('/:id', verifyRol, updateDocente)


export default router

