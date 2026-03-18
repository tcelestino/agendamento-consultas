import { Router } from 'express'
import { userController } from '../controllers'
import { authMiddleware, accessMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const usersRouter = Router()

usersRouter.post('/users', userController.create)
usersRouter.get(
  '/users',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  userController.findAll,
)
usersRouter.get('/users/me', authMiddleware, userController.getUserInfo)
usersRouter.get('/users/:id', authMiddleware, userController.findById)
usersRouter.patch('/users/:id', authMiddleware, userController.update)
usersRouter.delete(
  '/users/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  userController.delete,
)

export { usersRouter }
