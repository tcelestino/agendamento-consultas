import { Request, Response, NextFunction } from 'express'
import { authService } from '../services'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = authService.verifyAccessToken(token)
    req.userId = payload.sub as string
    req.userType = payload.userType as string
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
