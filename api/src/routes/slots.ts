import { Router } from 'express'
import { slotsController } from '../controllers'
import { accessMiddleware, authMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const slotsRouter = Router()

slotsRouter.get('/slots', authMiddleware, slotsController.listAll)
slotsRouter.post(
  '/slots',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  slotsController.create,
)
slotsRouter.get(
  '/slots/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  slotsController.findById,
)

export { slotsRouter }
