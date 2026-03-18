import { Request, Response } from 'express'
import { slotService, SlotService } from '../services'

export class SlotsController {
  constructor(private slotService: SlotService) {
    this.listAll = this.listAll.bind(this)
    this.create = this.create.bind(this)
    this.findById = this.findById.bind(this)
  }

  async create(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { specialityId, doctorName, availableDate } = req.body

    if (!specialityId || !doctorName || !availableDate) {
      return res
        .status(400)
        .json({ error: 'specialityId, doctorName e availableDate são obrigatórios' })
    }

    if (!availableDate.length) {
      return res.status(400).json({ error: 'availableDate não pode ser vazio' })
    }

    try {
      await this.slotService.create({ specialityId, doctorName, availableDate })
      return res.status(201).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listAll(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { specialityId, fields } = req.query
    try {
      let slots = []
      if (specialityId) {
        slots = await this.slotService.listAvailable(specialityId as string, fields as string)
      } else {
        slots = await this.slotService.listAll(fields as string)
      }
      return res.status(200).json(slots)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findById(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { id } = req.params
    const { fields } = req.query

    if (!id) {
      return res.status(400).json({ error: 'id é obrigatório' })
    }
    try {
      const slot = await this.slotService.findById(id as string, fields as string)
      return res.status(200).json(slot)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const slotsController = new SlotsController(slotService)
