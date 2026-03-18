import { USER_STATUS, USER_TYPE, IUserAddress } from '../models'

export interface IUser {
  id: string
  name: string
  email: string
  pass: string
  type: typeof USER_TYPE.USER | typeof USER_TYPE.EMPLOYEE
  address?: IUserAddress
  status?: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE
}

export type IUserPublic = Omit<IUser, 'pass'>
export type IUserPrivate = Omit<IUser, 'name' | 'email'>

export interface IUserRepository {
  create(user: IUser): Promise<void>
  update(id: string, data: Partial<IUser>): Promise<void>
  delete(id: string): Promise<void>
  findAll(): Promise<IUserPublic[]>
  findById(id: string, fields?: string): Promise<IUserPublic | null>
  findByEmail(email: string): Promise<IUserPrivate | null>
}
