import { Router } from 'express'
import { authController } from '../controllers'
import { authMiddleware } from '../middlewares'

const authRouter = Router()

authRouter.post('/auth/login', authController.login)
authRouter.post('/auth/logout', authMiddleware, authController.logout)

export { authRouter }
