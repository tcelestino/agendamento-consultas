import mongoose, { Document } from 'mongoose'

interface IAppointment extends Document {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  userId: string
  speciality: { id: string; name: string }
  slotId: string
}

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dateAppointment: {
    id: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  doctor: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  userId: { type: String, required: true, index: true },
  speciality: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  slotId: { type: String, required: true, index: true },
})

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)
