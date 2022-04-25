import { Request, Response } from "express"
import { pool } from "../pool"

export async function getAlumnos(req : Request, res: Response){

    const {id_user,rol} = req
    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getAlumnos = await pool.query(`SELECT 
                                                id_alumno,
                                                nie,
                                                (
                                                    (datos_personales).primer_nombre || ' ' || 
                                                    (datos_personales).segundo_nombre || ' ' ||
                                                    (datos_personales).primer_apellido || ' ' ||
                                                    (datos_personales).segundo_apellido
                                                ) AS Nombre_Completo, gg.nombre
                                                FROM alumno aa inner join grado gg
                                                on aa.id_grado = gg.id_grado
                                                order by gg.nombre desc`)

        res.json({ok: true, msg: 'Lista de alumnos', data: getAlumnos.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener alumnos', error })
    }
}



export async function getAlumnosById(req : Request, res: Response){
    const {id_user,rol} = req
    const {id} = req.params

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getAlumno = await pool.query(`SELECT 
                                            id_alumno,
                                            nie,
                                            (
                                                (datos_personales).primer_nombre || ' ' || 
                                                (datos_personales).segundo_nombre || ' ' ||
                                                (datos_personales).primer_apellido || ' ' ||
                                                (datos_personales).segundo_apellido
                                            ) AS Nombre_Completo, gg.nombre
                                            FROM alumno aa inner join grado gg
                                            on aa.id_grado = gg.id_grado WHERE id_alumno = $1`, [id])

        res.json({ok: true, msg: 'Lista de alumnos', data: getAlumno.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener alumnos', error })
    }
}



export async function postAlumno (req : Request, res: Response){
    const {id_user,rol} = req
    const {nie, primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, grado} = req.body

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }else{

            const id_grado = await pool.query('SELECT id_grado FROM grado WHERE nombre = $1', [grado])
           

            await pool.query(`INSERT INTO alumno (nie, datos_personales.primer_nombre,
                                                datos_personales.segundo_nombre,
                                                datos_personales.primer_apellido, 
                                                datos_personales.segundo_apellido,id_grado) VALUES($1, $2, $3, $4, $5, $6)`, 
                                                [nie, primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, id_grado.rows[0].id_grado])
    
           res.json({ok: true, msg: 'Alumno registrado correctamente'})
        }

        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al registrar alumno', error })
    }
}

export const updateAlumno = async  (req: Request, res: Response) => {
    const {id_user,rol} = req
    const {id} = req.params
    const {nie, primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, grado} = req.body
    const id_grado = await pool.query('SELECT id_grado FROM grado WHERE nombre = $1', [grado])

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }else{


            await pool.query(`UPDATE alumno SET nie = $1, datos_personales.primer_nombre = $2,
                                                datos_personales.segundo_nombre = $3,
                                                datos_personales.primer_apellido = $4, 
                                                datos_personales.segundo_apellido = $5, id_grado = $6 WHERE id_alumno = $7`, 
                                                [nie, primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, id_grado.rows[0].id_grado, id])
    
           res.json({ok: true, msg: 'Alumno actualizado correctamente'})
        }

        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al actualizar alumno', error })
    }

}

export const alumnoByGradoAndDocente = async (req: Request, res: Response) => {


    const {rol, docente} = req.body

    const split = docente.split(' ')
   

    try {

        if (rol != 'Docente') {
            res.json({ ok: false, msg: 'No tiene permisos para acceder a esta ruta, solo docentes puedes acceder a esta ruta' })
        }

        const alumnos = await pool.query(`SELECT
                                                id_alumno,
                                                nie,
                                                (
                                                (datos_personales).primer_nombre || ' ' || 
                                                (datos_personales).segundo_nombre || ' ' ||
                                                (datos_personales).primer_apellido || ' ' ||
                                                (datos_personales).segundo_apellido
                                                ) AS  alumno, mm.nombre_materia AS materia, gg.nombre AS grado
                                                FROM alumno
                                                INNER JOIN grado gg ON
                                                alumno.id_grado = gg.id_grado
                                                INNER JOIN docente dd ON
                                                gg.id_grado = dd.id_grado
                                                INNER JOIN materia mm ON
                                                dd.id_materia = mm.id_materia
                                                WHERE (datos_personal).primer_nombre = $1
                                                AND 
                                                (datos_personal).primer_apellido = $2`, [split[0], split[1]])

        if (alumnos.rowCount > 0) {
            res.json({ ok: true, msg: 'Lista de alumnos', data: alumnos.rows })
        } else {
            res.json({ ok: false, msg: `No existe el docente llamado ${docente} o el grado de este docente aun no tiene alumnos asignados` })
            
        }

    } catch (error) {
        res.json({ ok: false, msg: 'Ocurrió un error', error })
    }


}