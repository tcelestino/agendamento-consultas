import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { appointmentService, authService } from '../../src/services'

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
  appointmentService: {
    create: vi.fn(),
    listAll: vi.fn(),
    listByUserId: vi.fn(),
    cancel: vi.fn(),
    delete: vi.fn(),
  },
  AppointmentService: vi.fn(),
}))

vi.mock('../../src/services/consultationType.service', () => ({
  consultationTypeService: {},
  ConsultationTypeService: vi.fn(),
}))

vi.mock('../../src/services/consultationSlot.service', () => ({
  consultationSlotService: {},
  ConsultationSlotService: vi.fn(),
}))

vi.mock('../../src/services/info.service', () => ({
  infoService: {},
  InfoService: vi.fn(),
}))

describe('AppointmentsController', () => {
  const BASE = '/api/v1'

  const USER_TOKEN = 'user-token'
  const EMPLOYEE_TOKEN = 'employee-token'

  const userAuth = { Authorization: `Bearer ${USER_TOKEN}` }
  const employeeAuth = { Authorization: `Bearer ${EMPLOYEE_TOKEN}` }

  const mockAppointment = {
    id: 'appt-1',
    userId: 'user-1',
    slotId: 'slot-1',
    status: 'confirmed',
    dateAppointment: { id: 'date-1', date: '2026-03-10', time: '09:00' },
    doctor: { id: 'doctor-1', name: 'Dr. House' },
    speciality: 'Cardiologia',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.verifyAccessToken).mockImplementation((token: string) => {
      if (token === USER_TOKEN) return { sub: 'user-1', userType: 'user' }
      if (token === EMPLOYEE_TOKEN) return { sub: 'employee-1', userType: 'employee' }
      throw new Error('Token inválido')
    })
  })

  describe('POST /appointments', () => {
    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app).post(`${BASE}/appointments`).send({
        slotId: 'slot-1',
        availableDateId: 'date-1',
      })

      expect(res.status).toBe(401)
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`${BASE}/appointments`)
        .set(userAuth)
        .send({ slotId: 'slot-1' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('obrigatórios')
    })

    it('returns 201 on successful appointment creation', async () => {
      vi.mocked(appointmentService.create).mockResolvedValue()

      const res = await request(app).post(`${BASE}/appointments`).set(userAuth).send({
        slotId: 'slot-1',
        availableDateId: 'date-1',
      })

      expect(res.status).toBe(201)
    })

    it('returns 400 when service throws an error', async () => {
      vi.mocked(appointmentService.create).mockRejectedValue(new Error('Horário indisponível'))

      const res = await request(app).post(`${BASE}/appointments`).set(userAuth).send({
        slotId: 'slot-1',
        availableDateId: 'date-1',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Horário indisponível')
    })
  })

  describe('GET /appointments', () => {
    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app).get(`${BASE}/appointments`)

      expect(res.status).toBe(401)
    })

    it('returns 403 when user does not have employee access', async () => {
      const res = await request(app).get(`${BASE}/appointments`).set(userAuth)

      expect(res.status).toBe(403)
    })

    it('returns 200 with all appointments for employee', async () => {
      vi.mocked(appointmentService.listAll).mockResolvedValue([mockAppointment])

      const res = await request(app).get(`${BASE}/appointments`).set(employeeAuth)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('id', 'appt-1')
    })

    it('returns 400 on internal error while listing', async () => {
      vi.mocked(appointmentService.listAll).mockRejectedValue(new Error('Database error'))

      const res = await request(app).get(`${BASE}/appointments`).set(employeeAuth)

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Database error')
    })
  })

  describe('GET /appointments/:userId', () => {
    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app).get(`${BASE}/appointments/user-1`)

      expect(res.status).toBe(401)
    })

    it('returns 401 when user tries to access another user appointments', async () => {
      const res = await request(app).get(`${BASE}/appointments/user-2`).set(userAuth)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Acesso negado')
    })

    it('returns 200 with list of appointments for the authenticated user', async () => {
      vi.mocked(appointmentService.listByUserId).mockResolvedValue([mockAppointment])

      const res = await request(app).get(`${BASE}/appointments/user-1`).set(userAuth)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('id', 'appt-1')
    })

    it('returns 200 with empty list when user has no appointments', async () => {
      vi.mocked(appointmentService.listByUserId).mockResolvedValue([])

      const res = await request(app).get(`${BASE}/appointments/user-1`).set(userAuth)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns 200 when employee accesses another user appointments', async () => {
      vi.mocked(appointmentService.listByUserId).mockResolvedValue([mockAppointment])

      const res = await request(app).get(`${BASE}/appointments/user-1`).set(employeeAuth)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
    })

    it('returns 400 on internal error while listing', async () => {
      vi.mocked(appointmentService.listByUserId).mockRejectedValue(new Error('Database error'))

      const res = await request(app).get(`${BASE}/appointments/user-1`).set(userAuth)

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Database error')
    })
  })

  describe('DELETE /appointments/:id', () => {
    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app)
        .delete(`${BASE}/appointments/appt-1`)
        .query({ availableDateId: 'date-1' })

      expect(res.status).toBe(401)
    })

    it('returns 403 when user does not have employee access', async () => {
      const res = await request(app)
        .delete(`${BASE}/appointments/appt-1`)
        .set(userAuth)
        .query({ availableDateId: 'date-1' })

      expect(res.status).toBe(403)
    })

    it('returns 400 when availableDateId is missing', async () => {
      const res = await request(app).delete(`${BASE}/appointments/appt-1`).set(employeeAuth)

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    it('returns 204 on successful appointment deletion', async () => {
      vi.mocked(appointmentService.delete).mockResolvedValue()

      const res = await request(app)
        .delete(`${BASE}/appointments/appt-1`)
        .set(employeeAuth)
        .query({ availableDateId: 'date-1' })

      expect(res.status).toBe(204)
    })

    it('returns 400 when service throws an error', async () => {
      vi.mocked(appointmentService.delete).mockRejectedValue(
        new Error('Agendamento não encontrado'),
      )

      const res = await request(app)
        .delete(`${BASE}/appointments/unknown`)
        .set(employeeAuth)
        .query({ availableDateId: 'date-1' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Agendamento não encontrado')
    })
  })
})
