import { Appointment } from '../../models'
import { IAppointmentData, IAppointmentRepository } from '../../repositories'
import { logger } from '../logs'

export class AppointmentRepository implements IAppointmentRepository {
  async create(data: Omit<IAppointmentData, 'createdAt'>): Promise<void> {
    try {
      await Appointment.create({
        ...data,
        createdAt: new Date(),
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar agendamento')
    }
  }

  async findAll(): Promise<IAppointmentData[]> {
    try {
      return await Appointment.find({}, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consultas')
    }
  }

  async findByUserId(userId: string): Promise<IAppointmentData[]> {
    try {
      return await Appointment.find({ userId }, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consultas por usuário')
    }
  }

  async findById(id: string): Promise<IAppointmentData | null> {
    try {
      return await Appointment.findOne({ id }, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consulta por id')
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const deleted = await Appointment.findOneAndDelete({ id })
      return deleted !== null
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar consulta')
    }
  }
}
