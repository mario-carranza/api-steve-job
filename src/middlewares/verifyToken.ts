import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface IPayload {
    id_user: number,
    u_name: string,
    u_email: string,
    rol: string,
    iat: number,
    exp: number
}



export const verifyToken = (req: Request, res: Response, next: NextFunction) => {

    const token = req.header('auth-token') as string
    if (!token) {
        return res.status(401).json('no hay token provisto')
    }



    const payload = jwt.verify(token, process.env.SECRET || 'SECRET_KEY_FOR_AUTH') as IPayload
    req.id_user = payload.id_user

    next()

}



