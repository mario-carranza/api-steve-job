import jwt from 'jsonwebtoken'


export const getToken = (id_user: number, name : string, email: string, password: string, rol : string) => {

    return new Promise((resolve, reject) => {

        const payload = { id_user, name, email, password, rol }

        jwt.sign(payload, process.env.SECRET || 'SECRET_KEY_FOR_AUTH', {
            expiresIn: '1d'
        }, (err, token) => {
            err && reject('No token created')

            resolve(token)
        })

    })

}