import { v4 as uuidv4 } from 'uuid'
import { SlotRepository, SpecialityRepository } from '../infra/repositories'
import { ISlotBooked, ISlotData, ISlotRepository, ISpecialityRepository } from '../repositories'

export class SlotService {
  constructor(
    private slotRepo: ISlotRepository,
    private specialtyRepo: ISpecialityRepository,
  ) {}

  async create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void> {
    const type = await this.specialtyRepo.findById(data.specialityId)

    if (!type) {
      throw new Error('Tipo de consulta não existe')
    }

    if (!data.availableDate.length) {
      throw new Error('Data não informada')
    }
    const { availableDate, ...rest } = data
    const saveSlotData = {
      availableDate: availableDate.map((data) => ({
        ...data,
        id: uuidv4(),
        isBooked: false,
      })),
      ...rest,
    }

    await this.slotRepo.create(saveSlotData)
  }

  async listAll(fields?: string): Promise<ISlotData[]> {
    return await this.slotRepo.findAll(fields)
  }

  async listAvailable(specialityId: string, fields?: string): Promise<ISlotData[]> {
    return await this.slotRepo.findAvailable(specialityId, fields)
  }

  async findById(id: string, fields?: string): Promise<ISlotData | null> {
    return await this.slotRepo.findById(id, fields)
  }

  async bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked> {
    const bookedSlot = await this.slotRepo.bookSlot(slotId, availableDateId, appointmentId)
    if (!bookedSlot) {
      throw new Error('Horário indisponível ou já ocupado')
    }

    return bookedSlot
  }

  async releaseSlot(appointmentId: string, availableDateId: string): Promise<void> {
    await this.slotRepo.releaseSlot(appointmentId, availableDateId)
  }
}

export const slotService = new SlotService(new SlotRepository(), new SpecialityRepository())
