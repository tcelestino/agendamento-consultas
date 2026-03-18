import mongoose, { Document } from 'mongoose'

export interface ISlotAvailableDate {
  _id?: string //mongodb id
  id: string
  date: string
  time: string
  isBooked: boolean
  appointmentId: string | null
}

interface ISlot extends Document {
  id: string
  specialityId: string
  doctor: { id: string; name: string }
  availableDate: ISlotAvailableDate[]
  createdAt: Date
}

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  specialityId: { type: String, required: true },
  doctor: {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
  },
  availableDate: [
    {
      id: { type: String, required: true, index: true, unique: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      isBooked: { type: Boolean, required: true, default: false },
      appointmentId: { type: String, default: null },
    },
  ],
  createdAt: { type: Date, required: true, default: Date.now },
})

export const Slot = mongoose.model<ISlot>('Slot', slotSchema)
