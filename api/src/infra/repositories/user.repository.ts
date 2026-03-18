import { IUser, IUserPublic, IUserPrivate, IUserRepository } from '../../repositories'
import { User } from '../../models'
import { logger } from '../logs'

export class UserRepository implements IUserRepository {
  constructor() {}

  async create(data: IUser): Promise<void> {
    try {
      await User.create({
        createdAt: new Date(),
        ...data,
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar uma conta')
    }
  }

  async findAll(): Promise<IUserPublic[]> {
    try {
      return await User.find({}, { pass: 0, _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuários')
    }
  }

  async findById(id: string, fields?: string): Promise<IUserPublic | null> {
    try {
      const projection = this.setFields(fields)
      return await User.findOne({ id }, projection).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuário')
    }
  }

  async findByEmail(email: string): Promise<IUserPrivate | null> {
    try {
      return await User.findOne({ email }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuário')
    }
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    try {
      await User.updateOne({ id }, { $set: data })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao atualizar usuário')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await User.deleteOne({ id })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar usuário')
    }
  }

  private setFields(fields?: string): Record<string, unknown> {
    const forbidden = new Set(['pass', '__v'])

    if (!fields) return { pass: 0, _id: 0, __v: 0 }

    const selected = Object.fromEntries(
      fields
        .trim()
        .split(',')
        .filter((f) => !forbidden.has(f))
        .map((f) => [f, 1]),
    )
    return { _id: 0, ...selected }
  }
}
