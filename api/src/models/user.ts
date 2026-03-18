import mongoose, { Document } from 'mongoose'

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

export const USER_TYPE = {
  USER: 'user',
  EMPLOYEE: 'employee',
}

export interface IUserAddress {
  zipCode: string
  street: string
  neighborhood: string
  city: string
  state: {
    name: string
    code: string
  }
}

interface IUser extends Document {
  id: string
  email: string
  name: string
  pass: string
  type: typeof USER_TYPE.USER | typeof USER_TYPE.EMPLOYEE
  status: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE
  address?: IUserAddress
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  pass: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: USER_STATUS.INACTIVE },
  address: {
    type: {
      zipCode: { type: String, required: true },
      street: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: {
        name: { type: String, required: true },
        code: { type: String, required: true },
      },
    },
    required: false,
    default: undefined,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', userSchema)
