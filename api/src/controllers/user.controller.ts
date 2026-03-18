import { Request, Response } from 'express'
import { userService, UserService, IUserUpdate } from '../services'
import { IUser } from '../repositories'
import { USER_TYPE } from '../models'

export class UserController {
  constructor(private userService: UserService) {
    this.create = this.create.bind(this)
    this.findAll = this.findAll.bind(this)
    this.findById = this.findById.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
  }

  async create(req: Request<IUser>, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Estão faltando alguns campos obrigatórios' })
      }

      await this.userService.create(req.body)
      return res.status(201).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll()
      return res.status(200).json(users)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const { id: userId } = req.params
    const { fields } = req.query

    try {
      const user = await this.userService.findById(userId, fields as string)
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async update(req: Request<{ id: string }, IUserUpdate>, res: Response) {
    const { id: userId } = req.params
    const userIdAuth = req.userId
    const userType = req.userType

    if (userId !== userIdAuth && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      await this.userService.update(userId, req.body)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const { id: userId } = req.params
    const userIdAuth = req.userId
    const userType = req.userType

    if (userId !== userIdAuth && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      await this.userService.delete(userId)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async getUserInfo(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { fields } = req.query
    try {
      const user = await this.userService.findById(userId, fields as string)
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const userController = new UserController(userService)
