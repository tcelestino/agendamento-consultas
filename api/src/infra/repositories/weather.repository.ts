import { AxiosInstance } from 'axios'
import { IWeatherApiResponse, IWeatherRepository } from '../../repositories'
import { logger } from '../logs'

export class WeatherRepository implements IWeatherRepository<IWeatherApiResponse> {
  constructor(private http: AxiosInstance) {}
  async getWeatherByCity(city: string, date?: string): Promise<IWeatherApiResponse> {
    try {
      const response = await this.http.get<IWeatherApiResponse>(
        `${process.env.WEATHER_API}/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&dt=${date ?? ''}&days=${process.env.WEATHER_API_DAY}&lang=pt`,
      )
      return response.data
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao tentar consultar clima')
    }
  }
}
