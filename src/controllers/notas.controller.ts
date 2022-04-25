import {Request, Response} from 'express'
import { pool } from '../pool'

export const getNotas = async (req : Request, res :Response) => {
    const grado : number =  parseInt(req.query.grado)

    try {
        const nomina = await pool.query(`SELECT
                                        (
                                        (datos_personales).primer_nombre || ' ' || 
                                            (datos_personales).segundo_nombre || ' ' ||
                                            (datos_personales).primer_apellido || ' ' ||
                                            (datos_personales).segundo_apellido
                                        ) AS alumno,
                                        nombre_materia as materia,
                                        nota_1,
                                        nota_2,
                                        nota_3,
                                        nota_final,
                                        periodo
                                        FROM alumno
                                        INNER JOIN nota ON
                                        nota.id_alumno = alumno.id_alumno
                                        INNER JOIN materia ON
                                        nota.id_materia = materia.id_materia
                                        INNER JOIN docente ON
                                        alumno.id_grado = docente.id_grado
                                        WHERE alumno.id_grado = $1`, [grado])
     
        res.status(200).json({ ok: true, data: nomina.rows })
    } catch (error) {

        res.status(201).json({ ok: false, error: 'Error al obtener las notas' })
    }


}

export const getNotasByAlumno = async (req : Request, res :Response) => {

    const alumno : number =  parseInt(req.params.alumno)
    try {
        const notas = await pool.query(`SELECT
                                            (
                                            (datos_personales).primer_nombre || ' ' || 
                                                (datos_personales).segundo_nombre || ' ' ||
                                                (datos_personales).primer_apellido || ' ' ||
                                                (datos_personales).segundo_apellido
                                            ) AS alumno,
                                            nombre_materia as materia,
                                            nota_1,
                                            nota_2,
                                            nota_3,
                                            nota_final,
                                            periodo
                                            FROM alumno
                                            INNER JOIN nota ON
                                            nota.id_alumno = alumno.id_alumno
                                            INNER JOIN materia ON
                                            nota.id_materia = materia.id_materia
                                            INNER JOIN docente ON
                                            alumno.id_grado = docente.id_grado
                                            WHERE alumno.id_alumno = $1`, [alumno])

        if (notas.rowCount > 0) {
            const primer_periodo = notas.rows.filter(item => item.periodo === '1')
            const segundo_periodo = notas.rows.filter(item => item.periodo === '2')
            const tercer_periodo = notas.rows.filter(item => item.periodo === '3')

            const _notas ={primer_periodo, segundo_periodo, tercer_periodo}
            res.status(200).json({ ok: true, data: _notas })
        }else{
            const _notas ={primer_periodo:null, segundo_periodo:null, tercer_periodo:null}
            res.status(201).json({ ok: false, data: null })
        }



    } catch (error) {
        res.status(400).json({ ok: false, msg: `Ocurrió un error al obtener las notas` })

    }

}

export const insertNotas = async (req : Request, res :Response) => {
    const {id_alumno, nota1, nota2, nota3, periodo, materia} = req.body
    try {
        //id de la materia
        const id_materia = await pool.query(`SELECT id_materia FROM materia WHERE nombre_materia = $1`, [materia])
        
        //calculo de nota final
        let _nota1 : number = nota1 * 0.35
        let _nota2 : number = nota2 * 0.35
        let _nota3 : number = nota3 * 0.30
        let _notaFinal : number = (_nota1 + _nota2 + _nota3).toFixed(2)
     
        
        
        //verificar existencia de notas de ese periodo
        
        const notas = await pool.query(`SELECT * FROM nota WHERE id_alumno = $1 AND id_materia = $2 AND periodo = $3`, [id_alumno, id_materia.rows[0].id_materia, periodo])
        if(notas.rowCount > 0){
            res.status(201).json({ok: false, msg: `Ya existen notas para este alumno en el periodo ${periodo} y de la materia ${materia}`}) 
            
        }else{
            
            await pool.query(`INSERT INTO nota (nota_1, nota_2, nota_3, id_materia, id_alumno, periodo, nota_final) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [  nota1, nota2, nota3, id_materia.rows[0].id_materia, id_alumno, periodo, _notaFinal])
            
            res.status(200).json({ok: true, msg: `Notas registradas correctamente`})
        }
        

        //insertar notas


    } catch (error) {
        res.status(400).json({ok: false, msg: `Ocurrió un error al insertar las notas`})
    }

}


export const updateNotas = (req : Request, res :Response) => {

}