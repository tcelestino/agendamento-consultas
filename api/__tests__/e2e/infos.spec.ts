import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { authService, addressService, weatherService } from '../../src/services'

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
  slotService: {},
  SlotService: vi.fn(),
}))

vi.mock('../../src/services/address.service', () => ({
  addressService: {
    getAddressByZipCode: vi.fn(),
  },
  AddressService: vi.fn(),
}))

vi.mock('../../src/services/weather.service', () => ({
  weatherService: {
    getWeatherByCity: vi.fn(),
  },
  WeatherService: vi.fn(),
}))

describe('InfosController', () => {
  const BASE = '/api/v1'

  const mockAddress = {
    street: 'Av. Paulista',
    neighborhood: 'Bela Vista',
    stateCode: 'SP',
    state: 'São Paulo',
    zipCode: '01310-100',
    city: 'São Paulo',
  }

  const mockWeather = {
    maxTemp: 28,
    minTemp: 18,
    condition: { text: 'Sunny', icon: '//cdn.icon.png' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.verifyAccessToken).mockReturnValue({ sub: 'user-1', userType: 'user' })
  })
  describe('GET /infos/address/:zipCode', () => {
    it('returns 200 with address data', async () => {
      vi.mocked(addressService.getAddressByZipCode).mockResolvedValue(mockAddress)

      const res = await request(app).get(`${BASE}/infos/address/01310100`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('city', 'São Paulo')
      expect(res.body).toHaveProperty('street', 'Av. Paulista')
      expect(res.body).toHaveProperty('stateCode', 'SP')
    })

    it('returns 500 when service throws an error', async () => {
      vi.mocked(addressService.getAddressByZipCode).mockRejectedValue(
        new Error('Erro ao tentar consultar CEP'),
      )

      const res = await request(app).get(`${BASE}/infos/address/00000000`)

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Erro ao tentar consultar CEP')
    })
  })

  describe('GET /infos/weather/:city', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get(`${BASE}/infos/weather/São Paulo`)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Token não fornecido')
    })

    it('returns 200 with weather data', async () => {
      vi.mocked(weatherService.getWeatherByCity).mockResolvedValue(mockWeather)

      const res = await request(app)
        .get(`${BASE}/infos/weather/São Paulo`)
        .query({ date: '2026-03-10' })
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('maxTemp', 28)
      expect(res.body).toHaveProperty('minTemp', 18)
      expect(res.body).toHaveProperty('condition')
    })

    it('returns 500 when service throws an error', async () => {
      vi.mocked(weatherService.getWeatherByCity).mockRejectedValue(
        new Error('Erro ao consultar clima'),
      )

      const res = await request(app)
        .get(`${BASE}/infos/weather/CidadeInvalida`)
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(500)
      expect(res.body).toHaveProperty('error', 'Erro ao consultar clima')
    })
  })
})
