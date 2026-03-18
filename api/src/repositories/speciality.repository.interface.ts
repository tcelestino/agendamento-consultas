export interface ISpecialityData {
  id: string
  name: string
  createdAt: Date
}

export interface ISpecialityRepository {
  create(name: string): Promise<void>
  delete(id: string): Promise<void>
  findAll(): Promise<ISpecialityData[]>
  findById(id: string): Promise<ISpecialityData | null>
  findByName(name: string): Promise<ISpecialityData | null>
}
