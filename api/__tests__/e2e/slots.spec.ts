import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { authService, slotService } from '../../src/services'

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
  specialityService: {},
  SpecialityService: vi.fn(),
}))

vi.mock('../../src/services/slot.service', () => ({
  slotService: {
    create: vi.fn(),
    listAll: vi.fn(),
    listAvailable: vi.fn(),
    findById: vi.fn(),
    bookSlot: vi.fn(),
    releaseSlot: vi.fn(),
  },
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

const BASE = '/api/v1'

const mockSlot = {
  id: 'slot-1',
  specialityId: 'type-1',
  doctorName: 'Dr. House',
  availableDate: [{ id: 'date-1', date: '2026-03-10', time: '09:00', isBooked: false }],
  createdAt: new Date().toISOString(),
}

const newSlotBody = {
  specialityId: 'type-1',
  doctorName: 'Dr. House',
  availableDate: [{ date: '2026-03-10', time: '09:00' }],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'employee' })
})

describe('SlotsController', () => {
  describe('GET /slots', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`${BASE}/slots`)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 200 with all slots when specialityId is not provided', async () => {
      vi.mocked(slotService.listAll).mockResolvedValue([mockSlot as never])

      const res = await request(app).get(`${BASE}/slots`).set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('id', 'slot-1')
    })

    it('returns 200 with available slots when specialityId is provided', async () => {
      vi.mocked(slotService.listAvailable).mockResolvedValue([mockSlot as never])

      const res = await request(app)
        .get(`${BASE}/slots`)
        .query({ specialityId: 'type-1' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(slotService.listAvailable).toHaveBeenCalledWith('type-1', undefined)
    })

    it('returns 200 with empty list when no slots exist', async () => {
      vi.mocked(slotService.listAll).mockResolvedValue([])

      const res = await request(app).get(`${BASE}/slots`).set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns 500 on internal error', async () => {
      vi.mocked(slotService.listAll).mockRejectedValue(new Error('Database error'))

      const res = await request(app).get(`${BASE}/slots`).set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Database error')
    })
  })

  describe('POST /slots', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).post(`${BASE}/slots`).send(newSlotBody)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 403 when user is not employee', async () => {
      vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'user' })

      const res = await request(app)
        .post(`${BASE}/slots`)
        .send(newSlotBody)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error', 'Acesso negado')
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`${BASE}/slots`)
        .send({ doctorName: 'Dr. House' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('obrigatórios')
    })

    it('returns 400 when availableDate is an empty array', async () => {
      const res = await request(app)
        .post(`${BASE}/slots`)
        .send({ specialityId: 'type-1', doctorName: 'Dr. House', availableDate: [] })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'availableDate não pode ser vazio')
    })

    it('returns 201 on successful slot creation', async () => {
      vi.mocked(slotService.create).mockResolvedValue()

      const res = await request(app)
        .post(`${BASE}/slots`)
        .send(newSlotBody)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(201)
    })

    it('returns 500 when service throws an error', async () => {
      vi.mocked(slotService.create).mockRejectedValue(new Error('Tipo de consulta não existe'))

      const res = await request(app)
        .post(`${BASE}/slots`)
        .send(newSlotBody)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Tipo de consulta não existe')
    })
  })

  describe('GET /slots/:id', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`${BASE}/slots/slot-1`)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 403 when user is not employee', async () => {
      vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'user' })

      const res = await request(app)
        .get(`${BASE}/slots/slot-1`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error', 'Acesso negado')
    })

    it('returns 200 with slot data', async () => {
      vi.mocked(slotService.findById).mockResolvedValue(mockSlot as never)

      const res = await request(app)
        .get(`${BASE}/slots/slot-1`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id', 'slot-1')
    })

    it('returns 500 on internal error when fetching by id', async () => {
      vi.mocked(slotService.findById).mockRejectedValue(new Error('Fetch error'))

      const res = await request(app)
        .get(`${BASE}/slots/slot-1`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Fetch error')
    })
  })
})
