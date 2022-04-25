import { NextFunction, Request, Response } from "express";

import jwt from 'jsonwebtoken'
import { IPayload } from "./verifyToken";




export const verifyRol = (req : Request, res : Response, next : NextFunction) => {

    const token = req.header('auth-token') as string

    if (!token) {
        return res.status(401).json('no hay token provisto, permiso denegado')
    }

    const payload = jwt.verify(token, process.env.SECRET || 'SECRET_KEY_FOR_AUTH') as IPayload
    req.id_user = payload.id_user
    req.rol = payload.rol

    next()

}