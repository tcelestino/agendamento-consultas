import { Router } from 'express'
import { appointmentsRouter } from './appointments'
import { specialtiesRouter } from './specialities'
import { slotsRouter } from './slots'
import { infosRouter } from './infos'
import { usersRouter } from './users'
import { authRouter } from './auth'

const router = Router()

router.get('/health/', (_req, res) => {
  res.send('OK')
})

router.use(appointmentsRouter)
router.use(specialtiesRouter)
router.use(slotsRouter)
router.use(infosRouter)
router.use(usersRouter)
router.use(authRouter)

export { router }
