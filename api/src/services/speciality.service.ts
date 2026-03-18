import { SpecialityRepository } from '../infra/repositories'
import { ISpecialityData, ISpecialityRepository } from '../repositories'

export class SpecialityService {
  constructor(private specialityRepo: ISpecialityRepository) {}

  async create(name: string): Promise<void> {
    const type = await this.specialityRepo.findByName(name)

    if (type) {
      throw new Error('Tipo de consulta já existe')
    }

    await this.specialityRepo.create(name)
  }

  async listAll(): Promise<ISpecialityData[]> {
    return this.specialityRepo.findAll()
  }

  async findById(id: string): Promise<ISpecialityData | null> {
    return this.specialityRepo.findById(id)
  }

  async delete(id: string): Promise<void> {
    const type = await this.specialityRepo.findById(id)

    if (!type) {
      throw new Error('Tipo de consulta não encontrado')
    }

    await this.specialityRepo.delete(id)
  }
}

export const specialityService = new SpecialityService(new SpecialityRepository())
