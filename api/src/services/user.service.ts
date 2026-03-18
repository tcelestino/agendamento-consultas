import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { IUser, IUserPublic, IUserPrivate, IUserRepository } from '../repositories'
import { UserRepository } from '../infra/repositories'
import { USER_STATUS, USER_TYPE } from '../models'

export type IUserUpdate = Partial<IUser>

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async create(data: IUser): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)
    if (user) {
      throw new Error('Email já cadastrado')
    }

    const isValid = this.validateData(data)
    if (!isValid) {
      throw new Error('Dados inválidos')
    }

    const dataCloned = { ...data }
    dataCloned.id = uuid()
    dataCloned.pass = await this.hashPassword(data.pass)

    await this.userRepository.create(dataCloned)
  }

  async findAll(): Promise<IUserPublic[]> {
    return await this.userRepository.findAll()
  }

  async findById(id: string, fields?: string): Promise<IUserPublic | null> {
    const user = await this.userRepository.findById(id, fields)
    if (!user) {
      return null
    }
    return user
  }

  async findByEmail(email: string): Promise<IUserPrivate | null> {
    return await this.userRepository.findByEmail(email)
  }

  async update(id: string, data: IUserUpdate): Promise<void> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Nenhum campo fornecido para atualização')
    }

    const { email, status, pass } = data

    if (email && !this.validateEmail(email)) {
      throw new Error('Email inválido')
    }
    if (status && !this.validateStatus(status)) {
      throw new Error('Status inválido')
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (pass) {
      const hashedPassword = await this.hashPassword(pass)
      data.pass = hashedPassword
    }

    await this.userRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    await this.userRepository.delete(id)
  }

  private validateData(data: IUser) {
    const { name, email, pass, type, status, address } = data
    if (!name || !email || !pass || !type) {
      return false
    }

    if (status && !this.validateStatus(status)) {
      return false
    }

    if (!type || !this.validateUserType(type)) {
      return false
    }

    if (type === USER_TYPE.USER && !address) {
      return false
    }

    return this.validateEmail(email)
  }

  private validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private validateUserType(type: string) {
    return type === USER_TYPE.USER || type === USER_TYPE.EMPLOYEE
  }

  private validateStatus(status: string) {
    return status === USER_STATUS.ACTIVE || status === USER_STATUS.INACTIVE
  }

  private async hashPassword(pass: string) {
    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    return await bcrypt.hash(pass, salt)
  }
}

export const userService = new UserService(new UserRepository())
