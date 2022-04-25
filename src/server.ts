import express, { Application } from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan';
import cors from 'cors'

//routes
import authRoutes from './routes/auth.routes'
import docenteRoutes from './routes/docente.routes'
import alumnoRoutes from './routes/alumnos.routes'
import notasRoutes from './routes/notas.routes'
import materiasRoutes from './routes/materias.routes'
import gradosRoutes from './routes/grados.routes'






dotenv.config()

export class Server {
    app: Application = express();
    port = process.env.PORT

    constructor() {
        this.settings()
        this.middlewares()
        this.routes()
    }

    //server settings
    settings(): void {
        this.app.set("port", this.port);
        this.app.set("json spaces", 2);

    }

    listen(): void {
        this.app.listen(this.port);
        console.log(`server on port ${this.app.get("port")}`);
    }


    //server middlewares
    middlewares(): void {
        this.app.use(morgan("dev"));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cors());
    }

    //server routes
    routes() {
        this.app.use("/api/auth", authRoutes)
        this.app.use('/api/docente', docenteRoutes)
        this.app.use('/api/alumno', alumnoRoutes)
        this.app.use('/api/notas', notasRoutes)
        this.app.use('/api/materias', materiasRoutes)
        this.app.use('/api/grados', gradosRoutes)


    }
}

