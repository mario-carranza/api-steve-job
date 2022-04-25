import { Request, Response } from 'express'
import { encryptPassword } from '../helpers/encryptPassword';
import { pool } from "../pool";
import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs'
import { getToken } from '../helpers/generateToken';
import { IPayload } from 'middlewares/verifyToken';



export const signUp = async (req: Request, res: Response) => {

    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, password, rol } = req.body
    const emailFormat = `${primer_nombre}.${primer_apellido}@stevejob.com`.toLocaleLowerCase()
    const nameFormat = `${primer_nombre} ${primer_apellido}`

    let entidad_id: number = 0

    try {

        //verificar nombre de docente o alumno
        if (rol === 'Docente') {
            //verificar id del docente mediante todo el nombre
            const isDocente = await pool.query('SELECT * FROM docente WHERE (datos_personal).primer_nombre = $1 AND (datos_personal).segundo_nombre = $2 AND (datos_personal).primer_apellido = $3 AND  (datos_personal).segundo_apellido = $4',
                [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido])

            if (isDocente.rowCount === 0) {
                return res.status(201).json({ ok: false, msg: 'Aun no existe este docente, el administrador debe crear un docente antes de registrarse como usuario' })
            }

            entidad_id = isDocente.rows[0].id_docente

        } else if (rol === 'Alumno') {
            //verificar id del alumno mediante todo el nombre
            const isAlumno = await pool.query('SELECT * FROM alumno WHERE (datos_personales).primer_nombre = $1 AND (datos_personales).segundo_nombre = $2 AND (datos_personales).primer_apellido = $3 AND  (datos_personales).segundo_apellido = $4',
                [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido])

            if (isAlumno.rowCount === 0) {
                return res.status(201).json({ ok: false, msg: 'Aun no existe este alumno, el administrador debe crear un alumno antes de registrarse como usuario' })
            }

            entidad_id = isAlumno.rows[0].id_alumno
        }

        //verificar que ese email no esté en uso
        const userExists = await pool.query(
            "SELECT  u_email FROM usuario WHERE u_email = $1",
            [emailFormat]);
        if (userExists.rowCount > 0) {
            return res.status(201).json({ ok: false, msg: 'El email ya está en uso' })
        }

        // incriptar contraseña
        const encrypted = encryptPassword(password)

        //extraer el id del rol que se ha recibido
        const getRolID = await pool.query('SELECT id_rol FROM rol WHERE rol = $1', [rol])

        //insertamos el nuevo usuario y luego lo extraemos para enviar la informacion
        await pool.query('INSERT INTO usuario (u_name, u_email, u_password, id_rol, _id) VALUES($1, $2, $3, $4, $5)', [nameFormat, emailFormat, encrypted, getRolID.rows[0].id_rol, entidad_id])
        const getNewUser = await pool.query('SELECT * FROM usuario WHERE u_email = $1', [emailFormat])

        //token
        const token = await getToken(getNewUser.rows[0].id_usuario, getNewUser.rows[0].u_name, getNewUser.rows[0].u_email, getNewUser.rows[0].u_password, rol) as string
        res.header('auth-token', token).status(200).json({
            ok: true,
            _id: getNewUser.rows[0]._id,
            name: getNewUser.rows[0].u_name,
            email: getNewUser.rows[0].u_email,
            rol,
            token
        })

    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Ocurrió un error', error })
    }
}


export const signIn = async (req: Request, res: Response) => {

    const { email, password} = req.body

    try {
        const userExists = await pool.query(
            "SELECT * FROM usuario WHERE u_email = $1",
            [email]);


        if (userExists.rowCount == 0) {
            return res.status(201).json({ ok: false, msg: 'el email no existe' })
        }

        const validPassword = bcrypt.compareSync(password, userExists.rows[0].u_password)

        if (!validPassword) {
            return res.status(201).json({
                ok: false,
                msg: "contraseña incorrecta",
            });
        }

        
      
        const getRol = await pool.query('SELECT rol FROM rol WHERE id_rol = $1', [userExists.rows[0].id_rol])
      

        //token
        const token = await getToken(userExists.rows[0].id_usuario, userExists.rows[0].u_name,  userExists.rows[0].u_email, userExists.rows[0].u_password,  getRol.rows[0].rol) as string
        res.header('auth-token', token).status(200).json({
            ok: true,
            _id : userExists.rows[0]._id,
            name: userExists.rows[0].u_name,
            email: userExists.rows[0].u_email,
            rol: getRol.rows[0].rol,
            token
        })

    } catch (error) {
        res.status(500).json({ ok: false, msg:'Ocurrió un error', error })
    }

}


export const profile = async (req: Request, res: Response) => {

    const user = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [req.id_user])

    if (!user) {
        res.status(400).json({ ok: false })
    }

    res.status(200).json({ ok: true, data: user.rows })

}



export const verifyMyToken = async (req: Request, res: Response) => {

    const token = req.header('auth-token') as string
    console.log(token)

    try {
        
        if (!token) {
            return res.status(401).json('no hay token provisto')
        }
    
        const payload = jwt.verify(token, process.env.SECRET || 'SECRET_KEY_FOR_AUTH') as IPayload
        res.json({
            ok: true,
            payload
        })
    } catch (error) {
        res.json({ok: false, msg : 'token invalido'})
    }
  
    

}

