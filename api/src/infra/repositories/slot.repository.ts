import { v4 as uuidv4 } from 'uuid'
import { Slot } from '../../models'
import { ISlotData, ISlotRepository, ISlotBooked } from '../../repositories'
import { logger } from '../logs'

export class SlotRepository implements ISlotRepository {
  async create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { specialityId, doctorName, ...rest } = data
      await Slot.create({
        id: uuidv4(),
        specialityId: specialityId,
        doctor: {
          id: uuidv4(),
          name: doctorName,
        },
        ...rest,
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar slot')
    }
  }

  async findAll(fields?: string): Promise<ISlotData[]> {
    try {
      const projection = this.setFields(fields)
      const results = await Slot.find({}, projection).lean()

      return results.map((doc) => ({
        ...doc,
        availableDate: doc.availableDate?.map(({ _id, ...rest }) => rest),
      })) as unknown as ISlotData[]
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar slots')
    }
  }

  async findAvailable(specialityId: string, fields?: string): Promise<ISlotData[]> {
    try {
      const results = await Slot.aggregate([
        {
          $match: {
            specialityId,
            availableDate: { $elemMatch: { isBooked: false } },
          },
        },
        {
          $addFields: {
            availableDate: {
              $filter: {
                input: '$availableDate',
                as: 'slot',
                cond: { $eq: ['$$slot.isBooked', false] },
              },
            },
          },
        },
        { $project: this.setAggregateFields(fields) },
      ])

      return results as unknown as ISlotData[]
    } catch (error) {
      logger.error(error, 'Erro ao encontrar slots disponíveis')
      throw new Error('Erro ao encontrar slots disponíveis')
    }
  }

  async findById(id: string, fields?: string): Promise<ISlotData | null> {
    try {
      const projection = this.setFields(fields)
      const result = await Slot.findOne({ id }, projection).lean()
      if (!result) return null
      return {
        ...result,
        availableDate: result.availableDate?.map(({ _id, ...rest }) => rest),
      } as unknown as ISlotData
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar slot')
    }
  }

  async bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked | null> {
    try {
      return await Slot.findOneAndUpdate(
        { id: slotId, 'availableDate.isBooked': false, 'availableDate.id': availableDateId },
        {
          $set: {
            'availableDate.$.isBooked': true,
            'availableDate.$.appointmentId': appointmentId,
          },
        },
        { returnDocument: 'after' },
      )
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao reservar slot')
    }
  }

  async releaseSlot(appointmentId: string, availableDateId: string): Promise<boolean> {
    try {
      const result = await Slot.findOneAndUpdate(
        { 'availableDate.appointmentId': appointmentId, 'availableDate.id': availableDateId },
        { $set: { 'availableDate.$.isBooked': false, 'availableDate.$.appointmentId': null } },
      )
      return result !== null
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao liberar slot')
    }
  }

  private setAggregateFields(fields?: string): Record<string, unknown> {
    const forbidden = new Set(['__v', 'availableDate._id'])

    if (!fields) return { _id: 0, __v: 0, 'availableDate._id': 0 }

    const selected = Object.fromEntries(
      fields
        .trim()
        .split(',')
        .filter((f) => !forbidden.has(f))
        .map((f) => [f, 1]),
    )
    return { _id: 0, ...selected }
  }

  private setFields(fields?: string): Record<string, unknown> {
    return fields
      ? Object.fromEntries([
          ['_id', 0],
          ...fields
            .trim()
            .split(',')
            .map((f) => [f, 1]),
        ])
      : { _id: 0, __v: 0 }
  }
}
