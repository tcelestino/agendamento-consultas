import axios from 'axios'
import { IWeatherRepository, IWeatherApiResponse } from '../repositories'
import { WeatherRepository } from '../infra/repositories'

export interface IWeatherResponse {
  maxTemp: number
  minTemp: number
  condition: { text: string; icon: string }
}

export class WeatherService {
  constructor(private weatherRepo: IWeatherRepository<IWeatherApiResponse>) {}

  async getWeatherByCity(city: string, date?: string): Promise<IWeatherResponse | null> {
    const response = await this.weatherRepo.getWeatherByCity(city, date)

    const { forecast } = response
    if (!forecast.forecastday.length) {
      return null
    }

    return {
      maxTemp: forecast.forecastday[0].day.maxtemp_c,
      minTemp: forecast.forecastday[0].day.mintemp_c,
      condition: {
        text: forecast.forecastday[0].day.condition.text,
        icon: forecast.forecastday[0].day.condition.icon,
      },
    }
  }
}

const httpClient = axios.create()

export const weatherService = new WeatherService(new WeatherRepository(httpClient))
