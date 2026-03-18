import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddressService } from '../../../src/services'
import { IAddressRepository, ViaCEPResponse } from '../../../src/repositories'

const makeAddressRepo = (): IAddressRepository<ViaCEPResponse> => ({
  getAddressByZipCode: vi.fn(),
})

const viaCEPResponse: ViaCEPResponse = {
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  complemento: '',
  unidade: '',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  estado: 'São Paulo',
  regiao: 'Sudeste',
  ibge: '3550308',
  gia: '1004',
  ddd: '11',
  siafi: '7107',
}

describe('AddressService', () => {
  let addressRepo: IAddressRepository<ViaCEPResponse>
  let service: AddressService

  beforeEach(() => {
    addressRepo = makeAddressRepo()
    service = new AddressService(addressRepo)
  })

  describe('getAddressByZipCode', () => {
    it('should return a mapped address from ViaCEP response', async () => {
      vi.mocked(addressRepo.getAddressByZipCode).mockResolvedValue(viaCEPResponse)

      const result = await service.getAddressByZipCode('01310-100')

      expect(result).toEqual({
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        stateCode: 'SP',
        state: 'São Paulo',
        zipCode: '01310-100',
        city: 'São Paulo',
      })
      expect(addressRepo.getAddressByZipCode).toHaveBeenCalledWith('01310-100')
    })

    it('should throw when repository returns null', async () => {
      vi.mocked(addressRepo.getAddressByZipCode).mockResolvedValue(null)

      await expect(service.getAddressByZipCode('00000000')).rejects.toThrow('Erro ao consultar CEP')
    })
  })
})
