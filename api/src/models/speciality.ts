import mongoose, { Document } from 'mongoose'

export interface ISpeciality extends Document {
  id: string
  name: string
  createdAt: Date
}

const specialitySchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Speciality = mongoose.model<ISpeciality>('Speciality', specialitySchema)
