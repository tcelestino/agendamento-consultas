import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpecialityRepository } from '../../../src/infra/repositories'
import { Speciality } from '../../../src/models'

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}))

vi.mock('../../../src/models', () => ({
  Speciality: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
  },
}))

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

const mockType = { id: 'type-1', name: 'General', createdAt: new Date() }

describe('SpecialityRepository', () => {
  let repository: SpecialityRepository

  beforeEach(() => {
    repository = new SpecialityRepository()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a consultation type with a generated uuid', async () => {
      vi.mocked(Speciality.create).mockResolvedValue({} as never)

      await repository.create('General')

      expect(Speciality.create).toHaveBeenCalledWith({ id: 'mock-uuid', name: 'General' })
    })

    it('should throw an error when create fails', async () => {
      vi.mocked(Speciality.create).mockRejectedValue(new Error('DB error'))

      await expect(repository.create('General')).rejects.toThrow('Erro ao criar tipo de consulta')
    })
  })

  describe('findAll', () => {
    it('should return all consultation types without internal fields', async () => {
      vi.mocked(Speciality.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockType]),
      } as never)

      const result = await repository.findAll()

      expect(Speciality.find).toHaveBeenCalledWith({}, { _id: 0, __v: 0 })
      expect(result).toEqual([mockType])
    })

    it('should return an empty array when no types exist', async () => {
      vi.mocked(Speciality.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as never)

      const result = await repository.findAll()

      expect(result).toEqual([])
    })

    it('should throw an error when findAll fails', async () => {
      vi.mocked(Speciality.find).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findAll()).rejects.toThrow('Erro ao encontrar tipos de consulta')
    })
  })

  describe('findById', () => {
    it('should return a consultation type by id', async () => {
      vi.mocked(Speciality.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockType),
      } as never)

      const result = await repository.findById('type-1')

      expect(Speciality.findOne).toHaveBeenCalledWith({ id: 'type-1' }, { _id: 0, __v: 0 })
      expect(result).toEqual(mockType)
    })

    it('should return null when type is not found', async () => {
      vi.mocked(Speciality.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should throw an error when findById fails', async () => {
      vi.mocked(Speciality.findOne).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findById('type-1')).rejects.toThrow(
        'Erro ao encontrar tipo de consulta',
      )
    })
  })

  describe('findByName', () => {
    it('should return a consultation type by name', async () => {
      vi.mocked(Speciality.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockType),
      } as never)

      const result = await repository.findByName('General')

      expect(Speciality.findOne).toHaveBeenCalledWith({ name: 'General' }, { _id: 0, __v: 0 })
      expect(result).toEqual(mockType)
    })

    it('should return null when name is not found', async () => {
      vi.mocked(Speciality.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never)

      const result = await repository.findByName('Unknown')

      expect(result).toBeNull()
    })
  })
})
