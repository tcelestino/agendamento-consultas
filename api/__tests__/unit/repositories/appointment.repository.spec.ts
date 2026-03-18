import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppointmentRepository } from '../../../src/infra/repositories'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  findOneAndDelete: vi.fn(),
}))

vi.mock('../../../src/models', () => ({
  Appointment: {
    create: mocks.create,
    find: mocks.find,
    findOne: mocks.findOne,
    findOneAndDelete: mocks.findOneAndDelete,
  },
}))

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

const mockAppointmentData = {
  id: 'apt-1',
  status: 'scheduled',
  dateAppointment: { id: 'date-1', date: '2026-03-10', time: '10:00' },
  doctor: { id: 'doc-1', name: 'Dr. Smith' },
  userId: 'user-1',
  speciality: { id: 'type-1', name: 'General' },
  slotId: 'slot-1',
}

describe('AppointmentRepository', () => {
  let repository: AppointmentRepository

  beforeEach(() => {
    repository = new AppointmentRepository()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create an appointment including createdAt', async () => {
      mocks.create.mockResolvedValue({})

      await repository.create(mockAppointmentData)

      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...mockAppointmentData, createdAt: expect.any(Date) }),
      )
    })

    it('should throw an error when create fails', async () => {
      mocks.create.mockRejectedValue(new Error('DB error'))

      await expect(repository.create(mockAppointmentData)).rejects.toThrow(
        'Erro ao criar agendamento',
      )
    })
  })

  describe('findAll', () => {
    it('should return all appointments', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([mockAppointmentData]) })

      const result = await repository.findAll()

      expect(mocks.find).toHaveBeenCalledWith({}, { _id: 0 })
      expect(result).toEqual([mockAppointmentData])
    })

    it('should return empty array when no appointments exist', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) })

      const result = await repository.findAll()

      expect(result).toEqual([])
    })

    it('should throw an error when find fails', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) })

      await expect(repository.findAll()).rejects.toThrow('Erro ao encontrar consultas')
    })
  })

  describe('findByUserId', () => {
    it('should return appointments for a given user', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([mockAppointmentData]) })

      const result = await repository.findByUserId('user-1')

      expect(mocks.find).toHaveBeenCalledWith({ userId: 'user-1' }, { _id: 0 })
      expect(result).toEqual([mockAppointmentData])
    })

    it('should return an empty array when no appointments found', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) })

      const result = await repository.findByUserId('user-no-appointments')

      expect(result).toEqual([])
    })

    it('should throw an error when find fails', async () => {
      mocks.find.mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) })

      await expect(repository.findByUserId('user-1')).rejects.toThrow(
        'Erro ao encontrar consultas por usuário',
      )
    })
  })

  describe('findById', () => {
    it('should return an appointment by id', async () => {
      mocks.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(mockAppointmentData) })

      const result = await repository.findById('apt-1')

      expect(mocks.findOne).toHaveBeenCalledWith({ id: 'apt-1' }, { _id: 0 })
      expect(result).toEqual(mockAppointmentData)
    })

    it('should return null when appointment is not found', async () => {
      mocks.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should throw an error when findOne fails', async () => {
      mocks.findOne.mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) })

      await expect(repository.findById('apt-1')).rejects.toThrow(
        'Erro ao encontrar consulta por id',
      )
    })
  })

  describe('deleteById', () => {
    it('should return true when appointment is successfully deleted', async () => {
      mocks.findOneAndDelete.mockResolvedValue({ id: 'apt-1' })

      const result = await repository.deleteById('apt-1')

      expect(result).toBe(true)
      expect(mocks.findOneAndDelete).toHaveBeenCalledWith({ id: 'apt-1' })
    })

    it('should return false when appointment is not found', async () => {
      mocks.findOneAndDelete.mockResolvedValue(null)

      const result = await repository.deleteById('non-existent')

      expect(result).toBe(false)
    })

    it('should throw an error when delete fails', async () => {
      mocks.findOneAndDelete.mockRejectedValue(new Error('DB error'))

      await expect(repository.deleteById('apt-1')).rejects.toThrow('Erro ao deletar consulta')
    })
  })
})
