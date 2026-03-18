import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../../../src/services'
import { IUserRepository, IUserPublic, IUserPrivate } from '../../../src/repositories'
import { USER_STATUS, USER_TYPE } from '../../../src/models'

const makeRepository = (): IUserRepository => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
})

const baseUser = {
  id: 'any-id',
  name: 'John Doe',
  email: 'john@example.com',
  pass: 'secret123',
  type: USER_TYPE.USER as typeof USER_TYPE.USER,
  address: {
    zipCode: '01310-100',
    street: 'Av. Paulista',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: { name: 'São Paulo', code: 'SP' },
  },
}

describe('UserService', () => {
  let repository: IUserRepository
  let service: UserService

  beforeEach(() => {
    repository = makeRepository()
    service = new UserService(repository)
  })

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      await service.create(baseUser)

      expect(repository.create).toHaveBeenCalledOnce()
      const saved = vi.mocked(repository.create).mock.calls[0][0]
      expect(saved.pass).not.toBe(baseUser.pass)
      expect(saved.id).toBeDefined()
    })

    it('should throw when required fields are missing', async () => {
      const invalid = { ...baseUser, name: '' }
      await expect(service.create(invalid)).rejects.toThrow('Dados inválidos')
    })

    it('should throw when email is invalid', async () => {
      const invalid = { ...baseUser, email: 'not-an-email' }
      await expect(service.create(invalid)).rejects.toThrow('Dados inválidos')
    })

    it('should throw when type is USER and address is missing', async () => {
      const { address: _, ...withoutAddress } = baseUser
      await expect(service.create(withoutAddress)).rejects.toThrow('Dados inválidos')
    })

    it('should throw when status is invalid', async () => {
      const invalid = { ...baseUser, status: 'unknown' as typeof USER_STATUS.ACTIVE }
      await expect(service.create(invalid)).rejects.toThrow('Dados inválidos')
    })

    it('should create an EMPLOYEE without address', async () => {
      const employee = {
        id: 'any-id',
        name: 'Jane Doe',
        email: 'jane@example.com',
        pass: 'secret123',
        type: USER_TYPE.EMPLOYEE,
      }

      await service.create(employee)
      expect(repository.create).toHaveBeenCalledOnce()
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: IUserPublic[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', type: 'user' },
      ]
      vi.mocked(repository.findAll).mockResolvedValue(users)

      const result = await service.findAll()
      expect(result).toEqual(users)
    })
  })

  describe('findById', () => {
    it('should return user when found', async () => {
      const user: IUserPublic = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        type: 'user',
      }
      vi.mocked(repository.findById).mockResolvedValue(user)

      const result = await service.findById('1')
      expect(result).toEqual(user)
    })

    it('should return null when user is not found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(null)

      const result = await service.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return user private data by email', async () => {
      const user: IUserPrivate = { id: '1', pass: 'hashed', type: 'user' }
      vi.mocked(repository.findByEmail).mockResolvedValue(user)

      const result = await service.findByEmail('alice@example.com')
      expect(result).toEqual(user)
    })
  })

  describe('update', () => {
    it('should update user when valid data is provided', async () => {
      vi.mocked(repository.findById).mockResolvedValue({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        type: 'user',
      })

      await service.update('1', { name: 'Alice Updated' })
      expect(repository.update).toHaveBeenCalledWith('1', { name: 'Alice Updated' })
    })

    it('should hash password when updating pass', async () => {
      vi.mocked(repository.findById).mockResolvedValue({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        type: 'user',
      })

      await service.update('1', { pass: 'newpassword' })

      const updateArg = vi.mocked(repository.update).mock.calls[0][1]
      expect(updateArg.pass).not.toBe('newpassword')
    })

    it('should throw when no fields are provided', async () => {
      await expect(service.update('1', {})).rejects.toThrow(
        'Nenhum campo fornecido para atualização',
      )
    })

    it('should throw when email is invalid', async () => {
      await expect(service.update('1', { email: 'bad-email' })).rejects.toThrow('Email inválido')
    })

    it('should throw when status is invalid', async () => {
      await expect(
        service.update('1', { status: 'unknown' as typeof USER_STATUS.ACTIVE }),
      ).rejects.toThrow('Status inválido')
    })

    it('should throw when user is not found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(null)
      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(
        'Usuário não encontrado',
      )
    })
  })

  describe('delete', () => {
    it('should delete user when found', async () => {
      vi.mocked(repository.findById).mockResolvedValue({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        type: 'user',
      })

      await service.delete('1')
      expect(repository.delete).toHaveBeenCalledWith('1')
    })

    it('should throw when user is not found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(null)
      await expect(service.delete('nonexistent')).rejects.toThrow('Usuário não encontrado')
    })
  })
})
