import { Router } from 'express'
import { specialtiesController } from '../controllers'
import { authMiddleware, accessMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const specialtiesRouter = Router()

specialtiesRouter.get('/specialities', authMiddleware, specialtiesController.listAll)
specialtiesRouter.post(
  '/specialities',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  specialtiesController.create,
)
specialtiesRouter.delete(
  '/specialities/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  specialtiesController.delete,
)

export { specialtiesRouter }
