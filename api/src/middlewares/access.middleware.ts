import { Request, Response, NextFunction } from 'express'
import { USER_TYPE } from '../models/user'

type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE]

export function accessMiddleware(...allowedTypes: UserType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userType) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    next()
  }
}
