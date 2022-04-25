import { Request, Response } from "express";
import { pool } from "../pool";

export const getDocentes = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getDocentes = await pool.query(`SELECT 
                                                id_docente,
                                                (
                                                    (datos_personal).primer_nombre || ' ' || 
                                                    (datos_personal).segundo_nombre || ' ' ||
                                                    (datos_personal).primer_apellido || ' ' ||
                                                    (datos_personal).segundo_apellido
                                                ) AS Nombre_Docente, mm.nombre_materia AS Materia, gg.nombre AS Grado
                                                FROM docente d
                                                INNER JOIN materia mm on d.id_materia = mm.id_materia
                                                INNER JOIN grado gg on d.id_grado = gg.id_grado
                                                order by gg.nombre desc`)

        res.json({ok: true, msg: 'Lista de docentes', data: getDocentes.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener docentes', error })
    }
}



export const getDocenteById = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    const {id} = req.params

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getDocente = await pool.query(`SELECT 
                                                id_docente,
                                                (
                                                    (datos_personal).primer_nombre || ' ' || 
                                                    (datos_personal).segundo_nombre || ' ' ||
                                                    (datos_personal).primer_apellido || ' ' ||
                                                    (datos_personal).segundo_apellido
                                                ) AS Nombre_Docente, mm.nombre_materia AS Materia, gg.nombre AS Grado
                                                FROM docente d
                                                INNER JOIN materia mm on d.id_materia = mm.id_materia
                                                INNER JOIN grado gg on d.id_grado = gg.id_grado WHERE id_docente = $1`, [id])

        res.json({ok: true, msg: 'docente', data: getDocente.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener docente', error })
    }

}




export const postDocente = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    const {primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, materia, grado} = req.body


    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }else{

            const id_materia = await pool.query('SELECT id_materia FROM materia WHERE nombre_materia = $1', [materia])
            const id_grado = await pool.query('SELECT id_grado FROM grado WHERE nombre = $1', [grado])

            //evaluar que ese grado no tenga un docente para
            const isDocente = await pool.query('SELECT * FROM docente WHERE id_grado = $1', [id_grado.rows[0].id_grado])
            if (isDocente.rowCount > 0) {
                res.json({ok: false, msg: 'Ya existe un docente para ese grado'})
            }else{

                await pool.query(`INSERT INTO docente 
                                                       (datos_personal.primer_nombre,
                                                       datos_personal.segundo_nombre,
                                                       datos_personal.primer_apellido, 
                                                       datos_personal.segundo_apellido, id_materia, id_grado) VALUES ($1, $2, $3, $4, $5, $6)`,
                                                       [primer_nombre, segundo_nombre, primer_apellido,segundo_apellido, id_materia.rows[0].id_materia, id_grado.rows[0].id_grado])
       
               res.json({ok: true, msg: 'docente agregado correctamente'})
            }
            
        }
    } catch (error) {
        res.json({ ok: false, msg: 'Error al agregar docente', error })
    }

    
}


export const updateDocente = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    const {id} = req.params
    const { materia, grado} = req.body

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }else{

            const id_materia = await pool.query('SELECT id_materia FROM materia WHERE nombre_materia = $1', [materia])
            const id_grado = await pool.query('SELECT id_grado FROM grado WHERE nombre = $1', [grado])
    
            await pool.query(`UPDATE docente SET 
                                                    id_materia = $1,
                                                    id_grado = $2
                                                    WHERE id_docente = $3`,
                                                    [id_materia.rows[0].id_materia, id_grado.rows[0].id_grado, id])
    
            res.json({ok: true, msg: 'docente actualizado correctamente'})
        }

        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al actualizar docente', error })
    }

    
}



export const getDocenteByMateria = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    const {materia} = req.params

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getDocente = await pool.query(`SELECT 
                                                id_docente,
                                                (
                                                    (datos_personal).primer_nombre || ' ' || 
                                                    (datos_personal).segundo_nombre || ' ' ||
                                                    (datos_personal).primer_apellido || ' ' ||
                                                    (datos_personal).segundo_apellido
                                                ) AS Nombre_Docente, mm.nombre_materia AS Materia, gg.nombre AS Grado
                                                FROM docente d
                                                INNER JOIN materia mm on d.id_materia = mm.id_materia
                                                INNER JOIN grado gg on d.id_grado = gg.id_grado WHERE mm.nombre_materia = $1`, [materia])

        res.json({ok: true, msg: 'docente', data: getDocente.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener docente', error })
    }

}


export const getDocenteByGrado = async (req:Request, res:Response) => {
    const {id_user,rol} = req
    const {grado} = req.params

    try {

        if(rol != 'Administrador'){
            res.json({ok :false, msg: 'No tiene permisos para acceder a esta ruta, solo administradores puedes acceder a esta ruta'})
        }

        const getDocente = await pool.query(`SELECT 
                                                id_docente,
                                                (
                                                    (datos_personal).primer_nombre || ' ' || 
                                                    (datos_personal).segundo_nombre || ' ' ||
                                                    (datos_personal).primer_apellido || ' ' ||
                                                    (datos_personal).segundo_apellido
                                                ) AS Nombre_Docente, mm.nombre_materia AS Materia, gg.nombre AS Grado
                                                FROM docente d
                                                INNER JOIN materia mm on d.id_materia = mm.id_materia
                                                INNER JOIN grado gg on d.id_grado = gg.id_grado WHERE gg.nombre = $1`, [grado])

        res.json({ok: true, msg: 'docente', data: getDocente.rows})
        
    } catch (error) {
        res.json({ ok: false, msg: 'Error al obtener docente', error })
    }

}