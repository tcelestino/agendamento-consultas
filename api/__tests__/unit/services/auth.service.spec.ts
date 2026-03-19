import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService, UserService } from '../../../src/services'

process.env.JWT_SECRET = 'test-secret'

describe('AuthService', () => {
  const makeUserService = () =>
    ({
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }) as unknown as UserService

  const privateUser = { id: 'user-1', pass: 'hashed-pass', type: 'user' as const }

  let userService: UserService
  let service: AuthService

  beforeEach(() => {
    userService = makeUserService()
    service = new AuthService(userService)
  })

  describe('login', () => {
    it('should return an access token on valid credentials', async () => {
      vi.spyOn(service as any, 'comparePassword').mockResolvedValue(true)
      vi.mocked(userService.findByEmail).mockResolvedValue(privateUser)

      const result = await service.login('alice@example.com', 'secret')

      expect(result).toHaveProperty('accessToken')
      expect(result).not.toHaveProperty('refreshToken')
    })

    it('should throw when user is not found', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(null)

      await expect(service.login('unknown@example.com', 'secret')).rejects.toThrow(
        'Usuário não encontrado',
      )
    })

    it('should throw when password is invalid', async () => {
      vi.spyOn(service as any, 'comparePassword').mockResolvedValue(false)
      vi.mocked(userService.findByEmail).mockResolvedValue(privateUser)

      await expect(service.login('alice@example.com', 'wrong')).rejects.toThrow('Senha inválida')
    })
  })

  describe('generateAccessToken / verifyAccessToken', () => {
    it('should generate a verifiable access token with userId and userType', () => {
      const token = service.generateAccessToken('user-1', 'user')
      const payload = service.verifyAccessToken(token)

      expect(payload.sub).toBe('user-1')
      expect(payload.userType).toBe('user')
    })

    it('should throw when verifying an invalid access token', () => {
      expect(() => service.verifyAccessToken('bad-token')).toThrow()
    })
  })
})
