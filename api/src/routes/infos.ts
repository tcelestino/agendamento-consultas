import { Router } from 'express'
import { infosController } from '../controllers'
import { authMiddleware } from '../middlewares'

const infosRouter = Router()

infosRouter.get('/infos/address/:zipCode', infosController.getAddress)
infosRouter.get('/infos/weather/:city', authMiddleware, infosController.getWeather)

export { infosRouter }
