import { Request, Response } from 'express';
import {pool} from '../pool';


export const getGrados = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM grado');
        return res.status(200).json(result.rows);
    } catch (error) {
        res.status(204).json({ok: false,msg:'ocurrió un error'});	
    }
}