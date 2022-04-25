
import { profile, signIn, signUp, verifyMyToken } from "../controllers/auth.controller";
import { Router } from "express";
import { check } from "express-validator";
import { validate } from "../middlewares/validation";
import { verifyToken } from "../middlewares/verifyToken";

const router: Router = Router()

router.post('/signup',
    [
        check('primer_nombre', 'el primer nombre de usuario es obligatorio').not().isEmpty(),
        check('segundo_nombre', 'el segundo nombre de usuario es obligatorio').not().isEmpty(),
        check('primer_apellido', 'el primer apellido de usuario es obligatorio').not().isEmpty(),
        check('segundo_apellido', 'el segundo apellido de usuario es obligatorio').not().isEmpty(),
        check('password', 'la contraseña debe ser mayor o igual a 5 caracteres').isLength({ min: 5 }),
        check('rol', 'el rol es obligatorio').isLength({min :1}),
        validate

    ],
    signUp)


router.post('/signin',
    [
        check('email', 'el email es obligatorio').isEmail(),
        check('password', 'la contraseña es obligatoria').isLength({ min: 8 })
    ],
    signIn)

router.get('/profile', verifyToken, profile)
router.get('/verify', verifyMyToken)





export default router;