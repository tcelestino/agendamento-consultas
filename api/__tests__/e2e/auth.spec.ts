import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { authService } from '../../src/services'

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    verifyAccessToken: vi.fn(),
    generateAccessToken: vi.fn(),
  },
  AuthService: vi.fn(),
}))

vi.mock('../../src/services/user.service', () => ({
  userService: {},
  UserService: vi.fn(),
}))

vi.mock('../../src/services/appointment.service', () => ({
  appointmentService: {},
  AppointmentService: vi.fn(),
}))

vi.mock('../../src/services/speciality.service', () => ({
  specialityService: {},
  SpecialityService: vi.fn(),
}))

vi.mock('../../src/services/slot.service', () => ({
  slotService: {},
  SlotService: vi.fn(),
}))

vi.mock('../../src/services/info.service', () => ({
  infoService: {},
  InfoService: vi.fn(),
}))

describe('AuthController', () => {
  const BASE = '/api/v1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /auth/login', () => {
    it('returns 400 when email or pass are missing', async () => {
      const res = await request(app).post(`${BASE}/auth/login`).send({ email: 'a@b.com' })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    it('returns 200 with accessToken on successful login', async () => {
      vi.mocked(authService.login).mockResolvedValue({ accessToken: 'access-token' })

      const res = await request(app)
        .post(`${BASE}/auth/login`)
        .send({ email: 'alice@example.com', pass: 'secret' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken', 'access-token')
    })

    it('returns 404 when user is not found', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Usuário não encontrado'))

      const res = await request(app)
        .post(`${BASE}/auth/login`)
        .send({ email: 'unknown@example.com', pass: 'secret' })

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error', 'Usuário não encontrado')
    })

    it('returns 401 when password is invalid', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Senha inválida'))

      const res = await request(app)
        .post(`${BASE}/auth/login`)
        .send({ email: 'alice@example.com', pass: 'wrong' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Senha inválida')
    })

    it('returns 500 on unexpected error', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Unexpected error'))

      const res = await request(app)
        .post(`${BASE}/auth/login`)
        .send({ email: 'alice@example.com', pass: 'secret' })

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Erro interno do servidor')
    })
  })

  describe('POST /auth/logout', () => {
    it('returns 401 when no authorization token is provided', async () => {
      const res = await request(app).post(`${BASE}/auth/logout`)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 401 when token is invalid', async () => {
      vi.mocked(authService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const res = await request(app)
        .post(`${BASE}/auth/logout`)
        .set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token inválido ou expirado')
    })

    it('returns 204 on successful logout', async () => {
      vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'user' })

      const res = await request(app)
        .post(`${BASE}/auth/logout`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(204)
    })
  })
})
