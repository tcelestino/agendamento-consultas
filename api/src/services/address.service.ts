import axios from 'axios'
import { IAddressRepository, ViaCEPResponse } from '../repositories'
import { AddressRepository } from '../infra/repositories'

export interface IAddressResponse {
  street: string
  neighborhood: string
  stateCode: string
  state: string
  zipCode: string
  city: string
}

export class AddressService {
  constructor(private infoRepo: IAddressRepository<ViaCEPResponse>) {}

  async getAddressByZipCode(zipCode: string): Promise<IAddressResponse> {
    const data = await this.infoRepo.getAddressByZipCode(zipCode)

    if (!data) {
      throw new Error('Erro ao consultar CEP')
    }
    const { logradouro, bairro, uf, estado, cep, localidade } = data

    return {
      street: logradouro,
      neighborhood: bairro,
      stateCode: uf,
      state: estado,
      zipCode: cep,
      city: localidade,
    }
  }
}

const httpClient = axios.create()

export const addressService = new AddressService(new AddressRepository(httpClient))
