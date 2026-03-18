import { Request, Response } from 'express'
import { authService, AuthService } from '../services'

export class AuthController {
  constructor(private authService: AuthService) {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  async login(req: Request, res: Response) {
    const { email, pass } = req.body

    if (!email || !pass) {
      return res.status(400).json({ error: 'Campo email e pass são obrigatórios' })
    }

    try {
      const tokens = await this.authService.login(email, pass)
      return res.status(200).json(tokens)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Usuário não encontrado') {
          return res.status(404).json({ error: error.message })
        }
        if (error.message === 'Senha inválida') {
          return res.status(401).json({ error: error.message })
        }
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async logout(req: Request, res: Response) {
    delete req.userId
    delete req.userType

    return res.status(204).send()
  }
}

export const authController = new AuthController(authService)
