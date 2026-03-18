import { Request, Response } from 'express'
import { addressService, AddressService, weatherService, WeatherService } from '../services'

export class InfosController {
  constructor(
    private addressService: AddressService,
    private weatherService: WeatherService,
  ) {
    this.getAddress = this.getAddress.bind(this)
    this.getWeather = this.getWeather.bind(this)
  }

  async getAddress(req: Request, res: Response) {
    const { zipCode } = req.params

    if (!zipCode) {
      return res.status(400).json({ error: 'zipCode é obrigatório' })
    }

    try {
      const result = await this.addressService.getAddressByZipCode(zipCode as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async getWeather(req: Request, res: Response) {
    const userId = req.userId
    const { city } = req.params
    const { date } = req.query

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!city) {
      return res.status(400).json({ error: 'city é obrigatório' })
    }

    try {
      const result = await this.weatherService.getWeatherByCity(city as string, date as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const infosController = new InfosController(addressService, weatherService)
