import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserService, userService } from '../services'

export class AuthService {
  constructor(private userService: UserService) {}

  async login(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const isPasswordValid = await this.comparePassword(pass, user.pass)
    if (!isPasswordValid) {
      throw new Error('Senha inválida')
    }

    const accessToken = this.generateAccessToken(user.id, user.type)

    return { accessToken }
  }

  generateAccessToken(userId: string, userType: string): string {
    return jwt.sign({ sub: userId, userType }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  }

  verifyAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
  }

  private async comparePassword(pass: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(pass, hashedPassword)
  }
}

export const authService = new AuthService(userService)
