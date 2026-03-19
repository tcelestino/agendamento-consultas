import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosInstance } from 'axios'
import { AddressRepository } from '../../../src/infra/repositories'

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

describe('AddressRepository', () => {
  const mockViaCEPResponse = {
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

  let repository: AddressRepository
  let mockHttpClient: { get: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockHttpClient = { get: vi.fn() }
    repository = new AddressRepository(mockHttpClient as unknown as AxiosInstance)
    vi.clearAllMocks()

    process.env.VIACEP_API = 'https://viacep.com.br/ws'
  })

  describe('getAddressByZipCode', () => {
    it('should return address data for a given zip code', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockViaCEPResponse })

      const result = await repository.getAddressByZipCode('01310100')

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('01310100'))
      expect(result).toEqual(mockViaCEPResponse)
    })

    it('should include /json/ suffix in the request URL', async () => {
      mockHttpClient.get.mockResolvedValue({ data: mockViaCEPResponse })

      await repository.getAddressByZipCode('01310100')

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('/json/'))
    })

    it('should return null when ViaCEP returns an error response', async () => {
      mockHttpClient.get.mockResolvedValue({ data: { erro: 'true' } })

      const result = await repository.getAddressByZipCode('00000000')

      expect(result).toBeNull()
    })

    it('should throw an error when the API call fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'))

      await expect(repository.getAddressByZipCode('01310100')).rejects.toThrow(
        'Erro ao tentar consultar CEP',
      )
    })
  })
})
