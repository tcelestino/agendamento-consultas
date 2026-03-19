import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { specialityService, authService } from '../../src/services'

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    verifyAccessToken: vi.fn(),
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
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
  specialityService: {
    create: vi.fn(),
    listAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
  },
  SpecialityService: vi.fn(),
}))

vi.mock('../../src/services/slot.service', () => ({
  slotService: {},
  SlotService: vi.fn(),
}))

vi.mock('../../src/services/address.service', () => ({
  addressService: {},
  AddressService: vi.fn(),
}))

vi.mock('../../src/services/weather.service', () => ({
  weatherService: {},
  WeatherService: vi.fn(),
}))

describe('SpecialitiesController', () => {
  const BASE = '/api/v1'

  const mockType = { id: 'type-1', name: 'Cardiologia', createdAt: new Date().toISOString() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.verifyAccessToken).mockReturnValue({
      sub: 'user-1',
      userType: 'employee',
    })
  })
  describe('GET /specialities', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`${BASE}/specialities`)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 200 with list of consultation types', async () => {
      vi.mocked(specialityService.listAll).mockResolvedValue([mockType as never])

      const res = await request(app)
        .get(`${BASE}/specialities`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('name', 'Cardiologia')
    })

    it('returns 200 with empty list when no types exist', async () => {
      vi.mocked(specialityService.listAll).mockResolvedValue([])

      const res = await request(app)
        .get(`${BASE}/specialities`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns 500 on error while listing', async () => {
      vi.mocked(specialityService.listAll).mockRejectedValue(new Error('Listing error'))

      const res = await request(app)
        .get(`${BASE}/specialities`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Listing error')
    })
  })

  describe('POST /specialities', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).post(`${BASE}/specialities`).send({ name: 'Cardiologia' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 403 when user is not employee', async () => {
      vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'user' })

      const res = await request(app)
        .post(`${BASE}/specialities`)
        .send({ name: 'Cardiologia' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error', 'Acesso negado')
    })

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/specialities`)
        .send({})
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'name é obrigatório')
    })

    it('returns 201 on successful consultation type creation', async () => {
      vi.mocked(specialityService.create).mockResolvedValue()

      const res = await request(app)
        .post(`${BASE}/specialities`)
        .send({ name: 'Cardiologia' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(201)
    })

    it('returns 500 when type already exists', async () => {
      vi.mocked(specialityService.create).mockRejectedValue(new Error('Tipo de consulta já existe'))

      const res = await request(app)
        .post(`${BASE}/specialities`)
        .send({ name: 'Cardiologia' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Tipo de consulta já existe')
    })
  })
})
