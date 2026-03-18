import { Router } from 'express'
import { appointmentsController } from '../controllers'
import { accessMiddleware, authMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const appointmentsRouter = Router()

appointmentsRouter.post('/appointments', authMiddleware, appointmentsController.save)
appointmentsRouter.get(
  '/appointments',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  appointmentsController.listAll,
)
appointmentsRouter.get('/appointments/:userId', authMiddleware, appointmentsController.listByUserId)
appointmentsRouter.delete('/appointments/:id', authMiddleware, appointmentsController.delete)
appointmentsRouter.patch('/appointments/:id/cancel', authMiddleware, appointmentsController.cancel)

export { appointmentsRouter }
