import bcrypt from 'bcryptjs'

export const encryptPassword = (password: string): string => {
    const salt = bcrypt.genSaltSync()
    const encrypted = bcrypt.hashSync(password, salt)
    console.log(encrypted)
    return encrypted;
    
}