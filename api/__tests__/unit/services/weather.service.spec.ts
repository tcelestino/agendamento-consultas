import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherService } from '../../../src/services'
import { IWeatherRepository, IWeatherApiResponse } from '../../../src/repositories'

describe('WeatherService', () => {
  const makeWeatherRepo = (): IWeatherRepository<IWeatherApiResponse> => ({
    getWeatherByCity: vi.fn(),
  })

  const weatherResponse: IWeatherApiResponse = {
    location: {} as IWeatherApiResponse['location'],
    current: {} as IWeatherApiResponse['current'],
    forecast: {
      forecastday: [
        {
          date: '2026-03-10',
          date_epoch: 0,
          astro: {} as IWeatherApiResponse['forecast']['forecastday'][0]['astro'],
          hour: [],
          day: {
            maxtemp_c: 30,
            mintemp_c: 20,
            condition: { text: 'Sunny', icon: '//cdn.icon.png', code: 1000 },
            maxtemp_f: 86,
            mintemp_f: 68,
            avgtemp_c: 25,
            avgtemp_f: 77,
            maxwind_mph: 10,
            maxwind_kph: 16,
            totalprecip_mm: 0,
            totalprecip_in: 0,
            totalsnow_cm: 0,
            avgvis_km: 10,
            avgvis_miles: 6,
            avghumidity: 60,
            daily_will_it_rain: 0,
            daily_chance_of_rain: 0,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            uv: 5,
          },
        },
      ],
    },
  }
  let weatherRepo: IWeatherRepository<IWeatherApiResponse>
  let service: WeatherService

  beforeEach(() => {
    weatherRepo = makeWeatherRepo()
    service = new WeatherService(weatherRepo)
  })

  describe('getWeatherByCity', () => {
    it('should return mapped weather data', async () => {
      vi.mocked(weatherRepo.getWeatherByCity).mockResolvedValue(weatherResponse)

      const result = await service.getWeatherByCity('São Paulo')

      expect(result).toEqual({
        maxTemp: 30,
        minTemp: 20,
        condition: { text: 'Sunny', icon: '//cdn.icon.png' },
      })
      expect(weatherRepo.getWeatherByCity).toHaveBeenCalledWith('São Paulo', undefined)
    })

    it('should forward date parameter to the repository', async () => {
      vi.mocked(weatherRepo.getWeatherByCity).mockResolvedValue(weatherResponse)

      await service.getWeatherByCity('São Paulo', '2026-03-10')

      expect(weatherRepo.getWeatherByCity).toHaveBeenCalledWith('São Paulo', '2026-03-10')
    })

    it('should return null when weather data is not available', async () => {
      vi.mocked(weatherRepo.getWeatherByCity).mockResolvedValue({
        ...weatherResponse,
        forecast: { forecastday: [] },
      })

      const result = await service.getWeatherByCity('São Paulo')

      expect(result).toBeNull()
    })
  })
})
