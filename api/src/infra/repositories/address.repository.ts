import { AxiosInstance } from 'axios'
import { IAddressRepository, ViaCEPResponse } from '../../repositories'
import { logger } from '../logs'

export class AddressRepository implements IAddressRepository<ViaCEPResponse> {
  constructor(private http: AxiosInstance) {}

  async getAddressByZipCode(zipCode: string): Promise<ViaCEPResponse | null> {
    try {
      const response = await this.http.get<ViaCEPResponse | { erro: string }>(
        `${process.env.VIACEP_API}/${zipCode}/json/`,
      )
      if ('erro' in response.data) {
        return null
      }

      return response.data as ViaCEPResponse
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao tentar consultar CEP')
    }
  }
}
