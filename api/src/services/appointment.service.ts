import { v4 as uuidv4 } from 'uuid'
import { IAppointmentRepository, IAppointmentData } from '../repositories'
import { AppointmentRepository } from '../infra/repositories'
import {
  UserService,
  userService,
  SlotService,
  slotService,
  SpecialityService,
  specialityService,
  WeatherService,
  weatherService,
} from '.'

export interface IAppointmentListResponse extends Omit<
  IAppointmentData,
  'createdAt' | 'speciality'
> {
  speciality: string
}

export interface ICreateAppointmentData {
  slotId: string
  userId: string
  availableDateId: string
}

export class AppointmentService {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private specialityService: SpecialityService,
    private slotService: SlotService,
    private userService: UserService,
    private weatherService: WeatherService,
  ) {}

  async create(data: ICreateAppointmentData): Promise<void> {
    const { slotId, availableDateId, userId } = data

    const [user, slot] = await Promise.all([
      this.userService.findById(userId),
      this.slotService.findById(slotId),
    ])

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (!slot) {
      throw new Error('Slot não encontrado')
    }

    const speciality = await this.specialityService.findById(slot.specialityId)
    if (!speciality) {
      throw new Error('Tipo de consulta não encontrado')
    }

    const appointmentId = uuidv4()
    const bookedSlot = await this.slotService.bookSlot(slotId, availableDateId, appointmentId)

    const bookedDate = bookedSlot.availableDate.find((book) => book.appointmentId === appointmentId)
    if (!bookedDate) {
      await this.slotService.releaseSlot(appointmentId, availableDateId)
      throw new Error('Data do agendamento não encontrada após reserva')
    }

    const { id, date, time } = bookedDate

    await this.appointmentRepo
      .create({
        id: appointmentId,
        status: 'active',
        dateAppointment: { id, date, time },
        doctor: bookedSlot.doctor,
        speciality: {
          id: speciality.id,
          name: speciality.name,
        },
        userId,
        slotId,
      })
      .catch(async () => {
        await this.slotService.releaseSlot(appointmentId, availableDateId)
        throw new Error('Internal server error')
      })
  }

  async listAll(): Promise<IAppointmentListResponse[]> {
    const appointments = await this.appointmentRepo.findAll()

    return appointments.map((appointment) => ({
      ...appointment,
      speciality: appointment.speciality.name,
    }))
  }

  async listByUserId(userId: string): Promise<Record<string, unknown>[]> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const appointments = await this.list(user.id)

    if (!user.address?.city) {
      return appointments.map((appointment) => ({ ...appointment, weather: {} }))
    }

    return Promise.all(
      appointments.map(async (appointment) => {
        const weather = await this.weatherService.getWeatherByCity(
          user.address!.city,
          appointment.dateAppointment.date.split('-').reverse().join('-'),
        )

        if (!weather) {
          return { ...appointment, weather: {} }
        }

        return {
          ...appointment,
          weather: {
            condition: weather.condition,
            max: weather.maxTemp,
            min: weather.minTemp,
          },
        }
      }),
    )
  }

  async delete(appointmentId: string, availableDateId: string): Promise<void> {
    const deleted = await this.appointmentRepo.deleteById(appointmentId)
    if (!deleted) {
      throw new Error('Agendamento não encontrado')
    }

    await this.slotService.releaseSlot(appointmentId, availableDateId)
  }

  private async list(userId: string): Promise<IAppointmentListResponse[]> {
    const appointments = await this.appointmentRepo.findByUserId(userId)

    return appointments.map((appointment) => ({
      id: appointment.id,
      userId: appointment.userId,
      dateAppointment: appointment.dateAppointment,
      status: appointment.status,
      doctor: {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
      },
      speciality: appointment.speciality.name,
      slotId: appointment.slotId,
    }))
  }
}

export const appointmentService = new AppointmentService(
  new AppointmentRepository(),
  specialityService,
  slotService,
  userService,
  weatherService,
)
