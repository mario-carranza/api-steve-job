import { pool } from "../pool";


export const verifyUser = async (email: string): Promise<boolean> => {

    const userExists = await pool.query(
        "SELECT u_email FROM users WHERE u_email = $1",
        [email]);

    if (userExists.rowCount > 0) {
        return true
    } else {
        return false
    }
}