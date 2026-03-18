import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpecialityService } from '../../../src/services'
import { ISpecialityRepository, ISpecialityData } from '../../../src/repositories'

const makeRepository = (): ISpecialityRepository => ({
  findAll: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findByName: vi.fn(),
})

const baseType: ISpecialityData = {
  id: 'type-1',
  name: 'Cardiologia',
  createdAt: new Date(),
}

describe('SpecialityService', () => {
  let repository: ISpecialityRepository
  let service: SpecialityService

  beforeEach(() => {
    repository = makeRepository()
    service = new SpecialityService(repository)
  })

  describe('create', () => {
    it('should create a consultation type when name is unique', async () => {
      vi.mocked(repository.findByName).mockResolvedValue(null)

      await service.create('Cardiologia')

      expect(repository.create).toHaveBeenCalledWith('Cardiologia')
    })

    it('should throw when consultation type already exists', async () => {
      vi.mocked(repository.findByName).mockResolvedValue(baseType)

      await expect(service.create('Cardiologia')).rejects.toThrow('Tipo de consulta já existe')
      expect(repository.create).not.toHaveBeenCalled()
    })
  })

  describe('listAll', () => {
    it('should return all consultation types', async () => {
      vi.mocked(repository.findAll).mockResolvedValue([baseType])

      const result = await service.listAll()

      expect(result).toEqual([baseType])
    })

    it('should return empty array when there are no types', async () => {
      vi.mocked(repository.findAll).mockResolvedValue([])

      const result = await service.listAll()

      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('should return consultation type when found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(baseType)

      const result = await service.findById('type-1')

      expect(result).toEqual(baseType)
    })

    it('should return null when type is not found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(null)

      const result = await service.findById('unknown')

      expect(result).toBeNull()
    })
  })
})
