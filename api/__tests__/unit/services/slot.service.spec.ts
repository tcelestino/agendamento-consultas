import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SlotService } from '../../../src/services'
import {
  ISlotRepository,
  ISlotData,
  ISlotBooked,
  ISpecialityRepository,
  ISpecialityData,
} from '../../../src/repositories'

describe('SlotService', () => {
  const makeSlotRepo = (): ISlotRepository => ({
    create: vi.fn(),
    findAll: vi.fn(),
    findAvailable: vi.fn(),
    findById: vi.fn(),
    bookSlot: vi.fn(),
    releaseSlot: vi.fn(),
  })

  const makeTypeRepo = (): ISpecialityRepository => ({
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  })

  const baseType: ISpecialityData = {
    id: 'type-1',
    name: 'Cardiologia',
    createdAt: new Date(),
  }

  const baseSlot: ISlotData = {
    id: 'slot-1',
    specialityId: 'type-1',
    doctorName: 'Dr. House',
    availableDate: [
      { id: 'date-1', date: '2026-03-10', time: '09:00', isBooked: false, appointmentId: null },
    ],
    createdAt: new Date(),
  }

  const bookedSlot: ISlotBooked = {
    id: 'slot-1',
    specialityId: 'type-1',
    doctor: { id: 'doctor-1', name: 'Dr. House' },
    availableDate: [
      { id: 'date-1', date: '2026-03-10', time: '09:00', isBooked: true, appointmentId: 'appt-1' },
    ],
    createdAt: new Date(),
  }
  let slotRepo: ISlotRepository
  let typeRepo: ISpecialityRepository
  let service: SlotService

  beforeEach(() => {
    slotRepo = makeSlotRepo()
    typeRepo = makeTypeRepo()
    service = new SlotService(slotRepo, typeRepo)
  })

  describe('create', () => {
    it('should create a slot when type exists and dates are provided', async () => {
      vi.mocked(typeRepo.findById).mockResolvedValue(baseType)

      await service.create({
        specialityId: 'type-1',
        doctorName: 'Dr. House',
        availableDate: [
          { id: '', date: '2026-03-10', time: '09:00', isBooked: false, appointmentId: null },
        ],
      })

      expect(slotRepo.create).toHaveBeenCalledOnce()
      const saved = vi.mocked(slotRepo.create).mock.calls[0][0]
      expect(saved.availableDate[0].isBooked).toBe(false)
      expect(saved.availableDate[0].id).toBeDefined()
    })

    it('should throw when consultation type does not exist', async () => {
      vi.mocked(typeRepo.findById).mockResolvedValue(null)

      await expect(
        service.create({
          specialityId: 'unknown',
          doctorName: 'Dr. House',
          availableDate: [],
        }),
      ).rejects.toThrow('Tipo de consulta não existe')
    })

    it('should throw when no available dates are provided', async () => {
      vi.mocked(typeRepo.findById).mockResolvedValue(baseType)

      await expect(
        service.create({
          specialityId: 'type-1',
          doctorName: 'Dr. House',
          availableDate: [],
        }),
      ).rejects.toThrow('Data não informada')
    })
  })

  describe('listAll', () => {
    it('should return all slots', async () => {
      vi.mocked(slotRepo.findAll).mockResolvedValue([baseSlot])

      const result = await service.listAll()

      expect(result).toEqual([baseSlot])
    })
  })

  describe('listAvailable', () => {
    it('should return available slots for a consultation type', async () => {
      vi.mocked(slotRepo.findAvailable).mockResolvedValue([baseSlot])

      const result = await service.listAvailable('type-1')

      expect(result).toEqual([baseSlot])
      expect(slotRepo.findAvailable).toHaveBeenCalledWith('type-1', undefined)
    })
  })

  describe('findById', () => {
    it('should return slot when found', async () => {
      vi.mocked(slotRepo.findById).mockResolvedValue(baseSlot)

      const result = await service.findById('slot-1')

      expect(result).toEqual(baseSlot)
    })

    it('should return null when slot is not found', async () => {
      vi.mocked(slotRepo.findById).mockResolvedValue(null)

      const result = await service.findById('unknown')

      expect(result).toBeNull()
    })
  })

  describe('bookSlot', () => {
    it('should return booked slot on success', async () => {
      vi.mocked(slotRepo.bookSlot).mockResolvedValue(bookedSlot)

      const result = await service.bookSlot('slot-1', 'date-1', 'appt-1')

      expect(result).toEqual(bookedSlot)
      expect(slotRepo.bookSlot).toHaveBeenCalledWith('slot-1', 'date-1', 'appt-1')
    })

    it('should throw when slot is unavailable or already booked', async () => {
      vi.mocked(slotRepo.bookSlot).mockResolvedValue(null)

      await expect(service.bookSlot('slot-1', 'date-1', 'appt-1')).rejects.toThrow(
        'Horário indisponível ou já ocupado',
      )
    })
  })

  describe('releaseSlot', () => {
    it('should release a booked slot', async () => {
      vi.mocked(slotRepo.releaseSlot).mockResolvedValue(true)

      await service.releaseSlot('appt-1', 'date-1')

      expect(slotRepo.releaseSlot).toHaveBeenCalledWith('appt-1', 'date-1')
    })
  })
})
