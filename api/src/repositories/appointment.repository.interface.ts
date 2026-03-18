export interface IAppointmentData {
  id: string
  status: string
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  userId: string
  speciality: { id: string; name: string }
  createdAt: Date
  slotId: string
}

export interface IAppointmentRepository {
  create(data: Omit<IAppointmentData, 'createdAt'>): Promise<void>
  findAll(): Promise<IAppointmentData[]>
  findByUserId(userId: string): Promise<IAppointmentData[]>
  findById(id: string): Promise<IAppointmentData | null>
  deleteById(id: string): Promise<boolean>
}
