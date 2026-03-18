import express from 'express'
import cors from 'cors'
import { router } from './routes'
import { logsMiddleware } from './middlewares'

const app = express()

app.use(express.json())
app.use(cors())
app.use(logsMiddleware)
app.use(`/${process.env.API_PREFIX}/${process.env.API_VERSION}`, router)

export { app }
