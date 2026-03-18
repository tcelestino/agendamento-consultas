import { Request, Response } from 'express'
import { appointmentService, AppointmentService } from '../services'
import { USER_TYPE } from '../models'

export class AppointmentsController {
  constructor(private appointmentService: AppointmentService) {
    this.save = this.save.bind(this)
    this.listAll = this.listAll.bind(this)
    this.listByUserId = this.listByUserId.bind(this)
    this.delete = this.delete.bind(this)
  }

  async save(req: Request, res: Response) {
    const { slotId, availableDateId, userId: bodyUserId } = req.body
    const authUserId = req.userId
    const userType = req.userType

    const userId = userType === USER_TYPE.EMPLOYEE && bodyUserId ? bodyUserId : authUserId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    if (!slotId || !availableDateId) {
      return res.status(400).json({ error: 'Campos "slotId" e "availableDateId" são obrigatórios' })
    }

    try {
      await this.appointmentService.create({ slotId, availableDateId, userId })
      return res.status(201).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listAll(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    try {
      const result = await this.appointmentService.listAll()
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listByUserId(req: Request, res: Response) {
    const userIdAuth = req.userId
    const userType = req.userType
    const { userId } = req.params

    if (!userIdAuth) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    if (userIdAuth !== userId && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      const result = await this.appointmentService.listByUserId(userId as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    const { id } = req.params
    const { availableDateId } = req.query
    if (!id || !availableDateId) {
      return res
        .status(400)
        .json({ error: 'ID do agendamento e ID da data disponíveis são obrigatórios' })
    }
    try {
      await this.appointmentService.delete(id as string, availableDateId as string)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const appointmentsController = new AppointmentsController(appointmentService)
