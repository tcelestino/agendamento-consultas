import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherRepository } from '../../../src/infra/repositories'
import type { AxiosInstance } from 'axios'

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

describe('WeatherRepository', () => {
  const mockWeatherResponse = {
    location: {
      name: 'São Paulo',
      region: 'Sao Paulo',
      country: 'Brazil',
      lat: -23.5,
      lon: -46.6,
      tz_id: 'America/Sao_Paulo',
      localtime_epoch: 0,
      localtime: '2026-03-10 10:00',
    },
    current: {
      last_updated_epoch: 0,
      last_updated: '2026-03-10 10:00',
      temp_c: 25,
      temp_f: 77,
      is_day: 1,
      condition: { text: 'Sunny', icon: '', code: 1000 },
      wind_mph: 5,
      wind_kph: 8,
      wind_degree: 0,
      wind_dir: 'N',
      pressure_mb: 1013,
      pressure_in: 29.9,
      precip_mm: 0,
      precip_in: 0,
      humidity: 60,
      cloud: 0,
      feelslike_c: 25,
      feelslike_f: 77,
      windchill_c: 25,
      windchill_f: 77,
      heatindex_c: 25,
      heatindex_f: 77,
      dewpoint_c: 15,
      dewpoint_f: 59,
      vis_km: 10,
      vis_miles: 6,
      uv: 5,
      gust_mph: 7,
      gust_kph: 11,
      short_rad: 0,
      diff_rad: 0,
      dni: 0,
      gti: 0,
    },
    forecast: { forecastday: [] },
  }
  let repository: WeatherRepository
  let mockHttpClient: { get: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockHttpClient = { get: vi.fn() }
    repository = new WeatherRepository(mockHttpClient as unknown as AxiosInstance)
    vi.clearAllMocks()

    process.env.WEATHER_API = 'https://api.weatherapi.com'
    process.env.WEATHER_API_KEY = 'test-key'
    process.env.WEATHER_API_DAY = '3'
  })

  describe('getWeatherByCity', () => {
    it('should return weather data for a given city', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockWeatherResponse })

      const result = await repository.getWeatherByCity('São Paulo')

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('q=São Paulo'))
      expect(result).toEqual(mockWeatherResponse)
    })

    it('should include the date in the request URL when provided', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockWeatherResponse })

      await repository.getWeatherByCity('São Paulo', '2026-03-10')

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('dt=2026-03-10'))
    })

    it('should use an empty string for dt when date is not provided', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockWeatherResponse })

      await repository.getWeatherByCity('São Paulo')

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('dt='))
    })

    it('should throw an error when the API call fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'))

      await expect(repository.getWeatherByCity('São Paulo')).rejects.toThrow(
        'Erro ao tentar consultar clima',
      )
    })
  })
})
