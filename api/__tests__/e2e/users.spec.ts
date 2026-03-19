import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { userService, authService } from '../../src/services'

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    verifyAccessToken: vi.fn(),
    generateAccessToken: vi.fn(),
    comparePassword: vi.fn(),
  },
  AuthService: vi.fn(),
}))

vi.mock('../../src/services/user.service', () => ({
  userService: {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  UserService: vi.fn(),
}))

describe('UsersController', () => {
  const BASE = '/api/v1'
  const USER_TOKEN = 'user-token'
  const EMPLOYEE_TOKEN = 'employee-token'

  const userAuth = { Authorization: `Bearer ${USER_TOKEN}` }
  const employeeAuth = { Authorization: `Bearer ${EMPLOYEE_TOKEN}` }

  const mockUser = {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    type: 'user',
    address: {
      zipCode: '01310-100',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: { name: 'São Paulo', code: 'SP' },
    },
  }

  const newUserBody = {
    name: 'Alice',
    email: 'alice@example.com',
    pass: 'secret123',
    type: 'user',
    address: {
      zipCode: '01310-100',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: { name: 'São Paulo', code: 'SP' },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.verifyAccessToken).mockImplementation((token: string) => {
      if (token === USER_TOKEN) return { sub: 'user-1', userType: 'user' }
      if (token === EMPLOYEE_TOKEN) return { sub: 'employee-1', userType: 'employee' }
      throw new Error('Token inválido')
    })
  })
  describe('POST /users', () => {
    it('returns 201 on successful user creation', async () => {
      vi.mocked(userService.create).mockResolvedValue()

      const res = await request(app).post(`${BASE}/users`).send(newUserBody)

      expect(res.status).toBe(201)
    })

    it('returns 500 when email user is registered', async () => {
      vi.mocked(userService.create).mockRejectedValue(new Error('Email já cadastrado'))

      const res = await request(app).post(`${BASE}/users`).send(newUserBody)

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Email já cadastrado')
    })

    it('returns 400 when body is empty', async () => {
      const res = await request(app).post(`${BASE}/users`).send()

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Estão faltando alguns campos obrigatórios')
      expect(userService.create).not.toHaveBeenCalled()
    })

    it('returns 500 when creation fails with validation error', async () => {
      vi.mocked(userService.create).mockRejectedValue(new Error('Dados inválidos'))

      const res = await request(app).post(`${BASE}/users`).send({ name: 'Alice' })

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Dados inválidos')
    })

    it('returns 500 on internal error', async () => {
      vi.mocked(userService.create).mockRejectedValue(new Error('Database error'))

      const res = await request(app).post(`${BASE}/users`).send(newUserBody)

      expect(res.status).toBe(500)
    })
  })

  describe('GET /users', () => {
    it('returns 200 with list of users', async () => {
      vi.mocked(userService.findAll).mockResolvedValue([mockUser])

      const res = await request(app).get(`${BASE}/users`).set(employeeAuth)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('id', 'user-1')
    })

    it('returns 200 with empty list when no users exist', async () => {
      vi.mocked(userService.findAll).mockResolvedValue([])

      const res = await request(app).get(`${BASE}/users`).set(employeeAuth)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns 500 on internal error', async () => {
      vi.mocked(userService.findAll).mockRejectedValue(new Error('Database error'))

      const res = await request(app).get(`${BASE}/users`).set(employeeAuth)

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Database error')
    })
  })

  describe('GET /users/:id', () => {
    it('returns 200 with user data', async () => {
      vi.mocked(userService.findById).mockResolvedValue(mockUser)

      const res = await request(app).get(`${BASE}/users/user-1`).set(employeeAuth)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id', 'user-1')
      expect(res.body).toHaveProperty('name', 'Alice')
    })

    it('returns 404 when user is not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null)

      const res = await request(app).get(`${BASE}/users/unknown`).set(employeeAuth)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error', 'Usuário não encontrado')
    })
  })

  describe('PATCH /users/:id', () => {
    it('returns 200 on successful user update', async () => {
      vi.mocked(userService.update).mockResolvedValue()

      const res = await request(app)
        .patch(`${BASE}/users/user-1`)
        .set(userAuth)
        .send({ name: 'Alice Updated' })

      expect(res.status).toBe(204)
    })

    it('returns 500 on error during update', async () => {
      vi.mocked(userService.update).mockRejectedValue(new Error('Update error'))

      const res = await request(app).patch(`${BASE}/users/user-1`).set(userAuth).send({ name: 'X' })

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Update error')
    })
  })

  describe('DELETE /users/:id', () => {
    it('returns 200 on successful user deletion', async () => {
      vi.mocked(userService.delete).mockResolvedValue()

      const res = await request(app).delete(`${BASE}/users/user-1`).set(employeeAuth)

      expect(res.status).toBe(204)
    })

    it('returns 500 on error during deletion', async () => {
      vi.mocked(userService.delete).mockRejectedValue(new Error('Deletion error'))

      const res = await request(app).delete(`${BASE}/users/user-1`).set(employeeAuth)

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Deletion error')
    })
  })
})
