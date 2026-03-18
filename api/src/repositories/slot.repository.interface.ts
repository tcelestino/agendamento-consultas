import { ISlotAvailableDate } from '../models'

export interface ISlotData {
  id: string
  specialityId: string
  doctorName: string
  availableDate: ISlotAvailableDate[]
  createdAt: Date
}

export interface ISlotBooked extends Omit<ISlotData, 'doctorName'> {
  doctor: {
    id: string
    name: string
  }
}

export interface ISlotRepository {
  create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void>
  findAll(fields?: string): Promise<ISlotData[]>
  findAvailable(specialityId: string, fields?: string): Promise<ISlotData[]>
  findById(id: string, fields?: string): Promise<ISlotData | null>
  bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked | null>
  releaseSlot(appointmentId: string, availableDateId: string): Promise<boolean>
}
