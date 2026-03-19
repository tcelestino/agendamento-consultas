import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SlotRepository } from '../../../src/infra/repositories'
import { Slot } from '../../../src/models'

vi.mock('uuid', () => ({
  v4: vi
    .fn()
    .mockReturnValueOnce('slot-uuid')
    .mockReturnValueOnce('doctor-uuid')
    .mockReturnValue('any-uuid'),
}))

vi.mock('../../../src/models', () => ({
  Slot: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    aggregate: vi.fn(),
  },
}))

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

describe('SlotRepository', () => {
  const mockAvailableDate = {
    id: 'date-1',
    date: '2026-03-10',
    time: '10:00',
    isBooked: false,
    appointmentId: null,
  }

  const mockSlotDoc = {
    id: 'slot-1',
    consultationTypeId: 'type-1',
    doctor: { id: 'doc-1', name: 'Dr. Smith' },
    availableDate: [{ ...mockAvailableDate, _id: 'mongo-id' }],
    createdAt: new Date(),
  }

  const mockSlotResult = {
    ...mockSlotDoc,
    availableDate: [mockAvailableDate],
  }

  let repository: SlotRepository

  beforeEach(() => {
    repository = new SlotRepository()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a slot with generated uuids for id and doctor', async () => {
      vi.mocked(Slot.create).mockResolvedValue({} as never)

      await repository.create({
        specialityId: 'type-1',
        doctorName: 'Dr. Smith',
        availableDate: [mockAvailableDate],
      })

      expect(Slot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          specialityId: 'type-1',
          doctor: expect.objectContaining({ name: 'Dr. Smith' }),
          availableDate: [mockAvailableDate],
        }),
      )
    })

    it('should throw an error when create fails', async () => {
      vi.mocked(Slot.create).mockRejectedValue(new Error('DB error'))

      await expect(
        repository.create({
          specialityId: 'type-1',
          doctorName: 'Dr. Smith',
          availableDate: [],
        }),
      ).rejects.toThrow('Erro ao criar slot')
    })
  })

  describe('findAll', () => {
    it('should return all slots with _id stripped from availableDate', async () => {
      vi.mocked(Slot.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockSlotDoc]),
      } as never)

      const result = await repository.findAll()

      expect(Slot.find).toHaveBeenCalledWith({}, { _id: 0, __v: 0 })
      expect(result[0].availableDate[0]).not.toHaveProperty('_id')
    })

    it('should apply field projection when fields parameter is provided', async () => {
      vi.mocked(Slot.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockSlotDoc]),
      } as never)

      await repository.findAll('id,doctor')

      expect(Slot.find).toHaveBeenCalledWith({}, { _id: 0, id: 1, doctor: 1 })
    })

    it('should throw an error when findAll fails', async () => {
      vi.mocked(Slot.find).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findAll()).rejects.toThrow('Erro ao encontrar slots')
    })
  })

  describe('findAvailable', () => {
    it('should return slots with unbooked dates for a given consultation type', async () => {
      vi.mocked(Slot.aggregate).mockResolvedValue([mockSlotDoc])

      const result = await repository.findAvailable('type-1')

      expect(Slot.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: {
              specialityId: 'type-1',
              availableDate: { $elemMatch: { isBooked: false } },
            },
          }),
        ]),
      )
      expect(result).toHaveLength(1)
    })

    it('should throw an error when findAvailable fails', async () => {
      vi.mocked(Slot.aggregate).mockRejectedValue(new Error('DB error'))

      await expect(repository.findAvailable('type-1')).rejects.toThrow(
        'Erro ao encontrar slots disponíveis',
      )
    })
  })

  describe('findById', () => {
    it('should return a slot by id with _id stripped from availableDate', async () => {
      vi.mocked(Slot.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockSlotDoc),
      } as never)

      const result = await repository.findById('slot-1')

      expect(Slot.findOne).toHaveBeenCalledWith({ id: 'slot-1' }, { _id: 0, __v: 0 })
      expect(result).not.toBeNull()
      expect(result!.availableDate[0]).not.toHaveProperty('_id')
    })

    it('should return null when slot is not found', async () => {
      vi.mocked(Slot.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should throw an error when findById fails', async () => {
      vi.mocked(Slot.findOne).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findById('slot-1')).rejects.toThrow('Erro ao encontrar slot')
    })
  })

  describe('bookSlot', () => {
    it('should book an available date and return updated slot', async () => {
      const bookedSlot = {
        ...mockSlotDoc,
        availableDate: [{ ...mockAvailableDate, isBooked: true, appointmentId: 'apt-1' }],
      }
      vi.mocked(Slot.findOneAndUpdate).mockResolvedValue(bookedSlot as never)

      const result = await repository.bookSlot('slot-1', 'date-1', 'apt-1')

      expect(Slot.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'slot-1', 'availableDate.isBooked': false, 'availableDate.id': 'date-1' },
        { $set: { 'availableDate.$.isBooked': true, 'availableDate.$.appointmentId': 'apt-1' } },
        { returnDocument: 'after' },
      )
      expect(result).toEqual(bookedSlot)
    })

    it('should return null when slot or date is not found', async () => {
      vi.mocked(Slot.findOneAndUpdate).mockResolvedValue(null)

      const result = await repository.bookSlot('slot-1', 'date-1', 'apt-1')

      expect(result).toBeNull()
    })

    it('should throw an error when bookSlot fails', async () => {
      vi.mocked(Slot.findOneAndUpdate).mockRejectedValue(new Error('DB error'))

      await expect(repository.bookSlot('slot-1', 'date-1', 'apt-1')).rejects.toThrow(
        'Erro ao reservar slot',
      )
    })
  })

  describe('releaseSlot', () => {
    it('should return true when slot is successfully released', async () => {
      vi.mocked(Slot.findOneAndUpdate).mockResolvedValue({ id: 'slot-1' } as never)

      const result = await repository.releaseSlot('apt-1', 'date-1')

      expect(Slot.findOneAndUpdate).toHaveBeenCalledWith(
        { 'availableDate.appointmentId': 'apt-1', 'availableDate.id': 'date-1' },
        { $set: { 'availableDate.$.isBooked': false, 'availableDate.$.appointmentId': null } },
      )
      expect(result).toBe(true)
    })

    it('should return false when slot is not found', async () => {
      vi.mocked(Slot.findOneAndUpdate).mockResolvedValue(null)

      const result = await repository.releaseSlot('apt-1', 'date-1')

      expect(result).toBe(false)
    })

    it('should throw an error when releaseSlot fails', async () => {
      vi.mocked(Slot.findOneAndUpdate).mockRejectedValue(new Error('DB error'))

      await expect(repository.releaseSlot('apt-1', 'date-1')).rejects.toThrow(
        'Erro ao liberar slot',
      )
    })
  })
})
