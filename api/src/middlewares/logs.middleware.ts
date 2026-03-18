import pinoHttp from 'pino-http'
import { logger } from '../infra/logs'

export const logsMiddleware = pinoHttp({ logger })
