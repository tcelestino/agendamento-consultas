import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IAppointmentRepository, IAppointmentData } from '../../../src/repositories'
import {
  AppointmentService,
  SpecialityService,
  SlotService,
  UserService,
  WeatherService,
} from '../../../src/services/'

const makeAppointmentRepo = (): IAppointmentRepository => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findByUserId: vi.fn(),
  findById: vi.fn(),
  cancelById: vi.fn(),
  deleteById: vi.fn(),
})

const makeSpecialityService = () =>
  ({
    findById: vi.fn(),
    create: vi.fn(),
    list: vi.fn(),
  }) as unknown as SpecialityService

const makeSlotService = () =>
  ({
    findById: vi.fn(),
    bookSlot: vi.fn(),
    releaseSlot: vi.fn(),
    listAll: vi.fn(),
    listAvailable: vi.fn(),
    create: vi.fn(),
  }) as unknown as SlotService

const makeUserService = () =>
  ({
    findById: vi.fn(),
    findAll: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    comparePassword: vi.fn(),
  }) as unknown as UserService

const makeWeatherService = () =>
  ({
    getWeatherByCity: vi.fn(),
  }) as unknown as WeatherService

const baseUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  type: 'user' as const,
}

const baseSlot = {
  id: 'slot-1',
  specialityId: 'type-1',
  doctorName: 'Dr. House',
  availableDate: [],
  createdAt: new Date(),
}

const baseType = { id: 'type-1', name: 'Cardiologia', createdAt: new Date() }

const bookedSlot = {
  id: 'slot-1',
  specialityId: 'type-1',
  doctor: { id: 'doctor-1', name: 'Dr. House' },
  availableDate: [
    {
      id: 'date-1',
      date: '2026-03-10',
      time: '09:00',
      isBooked: true,
      appointmentId: 'PLACEHOLDER',
    },
  ],
  createdAt: new Date(),
}

describe('AppointmentService', () => {
  let repo: IAppointmentRepository
  let specialityService: SpecialityService
  let slotService: SlotService
  let userService: UserService
  let service: AppointmentService
  let weatherService: WeatherService

  beforeEach(() => {
    repo = makeAppointmentRepo()
    specialityService = makeSpecialityService()
    slotService = makeSlotService()
    userService = makeUserService()
    weatherService = makeWeatherService()
    service = new AppointmentService(
      repo,
      specialityService,
      slotService,
      userService,
      weatherService,
    )
  })

  describe('create', () => {
    it('should create an appointment when all data is valid', async () => {
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(slotService.findById).mockResolvedValue(baseSlot)
      vi.mocked(specialityService.findById).mockResolvedValue(baseType)
      vi.mocked(slotService.bookSlot).mockImplementation(
        async (_slotId, _dateId, appointmentId) => ({
          ...bookedSlot,
          availableDate: [{ ...bookedSlot.availableDate[0], appointmentId }],
        }),
      )
      vi.mocked(repo.create).mockResolvedValue()

      await service.create({ slotId: 'slot-1', userId: 'user-1', availableDateId: 'date-1' })

      expect(repo.create).toHaveBeenCalledOnce()
      const created = vi.mocked(repo.create).mock.calls[0][0]
      expect(created.status).toBe('active')
      expect(created.userId).toBe('user-1')
      expect(created.slotId).toBe('slot-1')
    })

    it('should throw when user is not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null)

      await expect(
        service.create({ slotId: 'slot-1', userId: 'unknown', availableDateId: 'date-1' }),
      ).rejects.toThrow('Usuário não encontrado')
    })

    it('should throw when slot is not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(slotService.findById).mockResolvedValue(null)

      await expect(
        service.create({ slotId: 'unknown', userId: 'user-1', availableDateId: 'date-1' }),
      ).rejects.toThrow('Slot não encontrado')
    })

    it('should throw when consultation type is not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(slotService.findById).mockResolvedValue(baseSlot)
      vi.mocked(specialityService.findById).mockResolvedValue(null)

      await expect(
        service.create({ slotId: 'slot-1', userId: 'user-1', availableDateId: 'date-1' }),
      ).rejects.toThrow('Tipo de consulta não encontrado')
    })

    it('should release slot and throw when appointment creation fails', async () => {
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(slotService.findById).mockResolvedValue(baseSlot)
      vi.mocked(specialityService.findById).mockResolvedValue(baseType)
      vi.mocked(slotService.bookSlot).mockImplementation(
        async (_slotId, _dateId, appointmentId) => ({
          ...bookedSlot,
          availableDate: [{ ...bookedSlot.availableDate[0], appointmentId }],
        }),
      )
      vi.mocked(repo.create).mockRejectedValue(new Error('DB error'))
      vi.mocked(slotService.releaseSlot).mockResolvedValue()

      await expect(
        service.create({ slotId: 'slot-1', userId: 'user-1', availableDateId: 'date-1' }),
      ).rejects.toThrow('Internal server error')

      expect(slotService.releaseSlot).toHaveBeenCalledOnce()
    })
  })

  describe('listAll', () => {
    it('should return all appointments with speciality as string', async () => {
      const appointmentData: IAppointmentData = {
        id: 'appt-1',
        status: 'active',
        dateAppointment: { id: 'date-1', date: '2026-03-10', time: '09:00' },
        doctor: { id: 'doctor-1', name: 'Dr. House' },
        userId: 'user-1',
        speciality: { id: 'type-1', name: 'Cardiologia' },
        createdAt: new Date(),
        slotId: 'slot-1',
      }
      vi.mocked(repo.findAll).mockResolvedValue([appointmentData])

      const result = await service.listAll()

      expect(result).toHaveLength(1)
      expect(result[0].speciality).toBe('Cardiologia')
    })

    it('should return empty array when no appointments exist', async () => {
      vi.mocked(repo.findAll).mockResolvedValue([])

      const result = await service.listAll()
      expect(result).toEqual([])
    })
  })

  describe('listByUserId', () => {
    it('should return mapped appointments with weather for a user without address', async () => {
      const appointmentData: IAppointmentData = {
        id: 'appt-1',
        status: 'active',
        dateAppointment: { id: 'date-1', date: '2026-03-10', time: '09:00' },
        doctor: { id: 'doctor-1', name: 'Dr. House' },
        userId: 'user-1',
        speciality: { id: 'type-1', name: 'Cardiologia' },
        createdAt: new Date(),
        slotId: 'slot-1',
      }
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(repo.findByUserId).mockResolvedValue([appointmentData])

      const result = await service.listByUserId('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].speciality).toBe('Cardiologia')
      expect(result[0]).not.toHaveProperty('createdAt')
      expect(result[0]).toHaveProperty('weather', {})
    })

    it('should return empty array when user has no appointments', async () => {
      vi.mocked(userService.findById).mockResolvedValue(baseUser)
      vi.mocked(repo.findByUserId).mockResolvedValue([])

      const result = await service.listByUserId('user-1')
      expect(result).toEqual([])
    })

    it('should throw when user is not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null)

      await expect(service.listByUserId('unknown')).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('cancel', () => {
    it('should cancel an appointment and release the slot', async () => {
      vi.mocked(repo.cancelById).mockResolvedValue(true)
      vi.mocked(slotService.releaseSlot).mockResolvedValue()

      await service.cancel('appt-1', 'date-1')

      expect(repo.cancelById).toHaveBeenCalledWith('appt-1')
      expect(slotService.releaseSlot).toHaveBeenCalledWith('appt-1', 'date-1')
    })

    it('should throw when appointment is not found', async () => {
      vi.mocked(repo.cancelById).mockResolvedValue(false)

      await expect(service.cancel('unknown', 'date-1')).rejects.toThrow(
        'Agendamento não encontrado',
      )
      expect(slotService.releaseSlot).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete an appointment and release the slot', async () => {
      vi.mocked(repo.deleteById).mockResolvedValue(true)
      vi.mocked(slotService.releaseSlot).mockResolvedValue()

      await service.delete('appt-1', 'date-1')

      expect(repo.deleteById).toHaveBeenCalledWith('appt-1')
      expect(slotService.releaseSlot).toHaveBeenCalledWith('appt-1', 'date-1')
    })

    it('should throw when appointment is not found', async () => {
      vi.mocked(repo.deleteById).mockResolvedValue(false)

      await expect(service.delete('unknown', 'date-1')).rejects.toThrow(
        'Agendamento não encontrado',
      )
      expect(slotService.releaseSlot).not.toHaveBeenCalled()
    })
  })
})
