import { Request, Response } from 'express'
import { specialityService, SpecialityService } from '../services'

export class SpecialtiesController {
  constructor(private specialityService: SpecialityService) {
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.listAll = this.listAll.bind(this)
  }

  async create(req: Request, res: Response) {
    const userId = req.userId
    const { name } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' })
    }

    try {
      await this.specialityService.create(name)
      return res.status(201).json()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!id) {
      return res.status(400).json({ error: 'id é obrigatório' })
    }

    try {
      await this.specialityService.delete(id as string)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listAll(_req: Request, res: Response) {
    try {
      const types = await this.specialityService.listAll()
      return res.status(200).json(types)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const specialtiesController = new SpecialtiesController(specialityService)
