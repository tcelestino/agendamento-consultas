import { v4 as uuidv4 } from 'uuid'
import { Speciality } from '../../models'
import { ISpecialityData, ISpecialityRepository } from '../../repositories'
import { logger } from '../logs'

export class SpecialityRepository implements ISpecialityRepository {
  async create(name: string): Promise<void> {
    try {
      await Speciality.create({ id: uuidv4(), name })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar tipo de consulta')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Speciality.deleteOne({ id })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar tipo de consulta')
    }
  }

  async findAll(): Promise<ISpecialityData[]> {
    try {
      return await Speciality.find({}, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipos de consulta')
    }
  }

  async findById(id: string): Promise<ISpecialityData | null> {
    try {
      return await Speciality.findOne({ id }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipo de consulta')
    }
  }

  async findByName(name: string): Promise<ISpecialityData | null> {
    try {
      return await Speciality.findOne({ name }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipo de consulta')
    }
  }
}
