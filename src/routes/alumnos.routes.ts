import { alumnoByGradoAndDocente, getAlumnos, getAlumnosById, postAlumno, updateAlumno } from '../controllers/alumno.controller'
import {Router} from 'express'
import { verifyRol } from '../middlewares/rolValidation'

const router  = Router()

router.get('/', verifyRol, getAlumnos)
router.get('/:id', verifyRol, getAlumnosById)
router.post('/', verifyRol, postAlumno)
router.put('/:id', verifyRol, updateAlumno)
router.post('/docente', verifyRol, alumnoByGradoAndDocente)




export default router
