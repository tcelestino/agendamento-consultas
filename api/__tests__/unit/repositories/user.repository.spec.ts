import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserRepository } from '../../../src/infra/repositories'
import { User } from '../../../src/models'

vi.mock('../../../src/models', () => ({
  User: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  },
  USER_TYPE: {
    USER: 'user',
    EMPLOYEE: 'employee',
  },
}))

vi.mock('../../../src/infra/logs', () => ({
  logger: { error: vi.fn() },
}))

describe('UserRepository', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    pass: 'hashed-pass',
    type: 'user' as const,
  }

  const mockUserPublic = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    userType: 'user' as const,
  }
  let repository: UserRepository

  beforeEach(() => {
    repository = new UserRepository()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a user with createdAt', async () => {
      vi.mocked(User.create).mockResolvedValue({} as never)

      await repository.create(mockUser)

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...mockUser, createdAt: expect.any(Date) }),
      )
    })

    it('should throw an error when save fails', async () => {
      vi.mocked(User.create).mockRejectedValue(new Error('DB error'))

      await expect(repository.create(mockUser)).rejects.toThrow('Erro ao criar uma conta')
    })
  })

  describe('findAll', () => {
    it('should return users without sensitive fields', async () => {
      vi.mocked(User.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockUserPublic]),
      } as never)

      const result = await repository.findAll()

      expect(User.find).toHaveBeenCalledWith({}, { pass: 0, _id: 0, __v: 0 })
      expect(result).toEqual([mockUserPublic])
    })

    it('should throw an error when findAll fails', async () => {
      vi.mocked(User.find).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findAll()).rejects.toThrow('Erro ao buscar usuários')
    })
  })

  describe('findById', () => {
    it('should return a user by id without sensitive fields', async () => {
      vi.mocked(User.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUserPublic),
      } as never)

      const result = await repository.findById('user-1')

      expect(User.findOne).toHaveBeenCalledWith({ id: 'user-1' }, { pass: 0, _id: 0, __v: 0 })
      expect(result).toEqual(mockUserPublic)
    })

    it('should return null when user is not found', async () => {
      vi.mocked(User.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as never)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should throw an error when findById fails', async () => {
      vi.mocked(User.findOne).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never)

      await expect(repository.findById('user-1')).rejects.toThrow('Erro ao buscar usuário')
    })
  })

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUserPrivate = { id: 'user-1', pass: 'hashed-pass', type: 'user' }
      vi.mocked(User.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUserPrivate),
      } as never)

      const result = await repository.findByEmail('john@example.com')

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' }, { _id: 0, __v: 0 })
      expect(result).toEqual(mockUserPrivate)
    })

    it('should return null when email is not found', async () => {
      vi.mocked(User.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as never)

      const result = await repository.findByEmail('notfound@example.com')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user fields', async () => {
      vi.mocked(User.updateOne).mockResolvedValue({} as never)

      await repository.update('user-1', { name: 'Jane Doe' })

      expect(User.updateOne).toHaveBeenCalledWith({ id: 'user-1' }, { $set: { name: 'Jane Doe' } })
    })

    it('should throw an error when update fails', async () => {
      vi.mocked(User.updateOne).mockRejectedValue(new Error('DB error'))

      await expect(repository.update('user-1', { name: 'Jane Doe' })).rejects.toThrow(
        'Erro ao atualizar usuário',
      )
    })
  })

  describe('delete', () => {
    it('should delete user by id', async () => {
      vi.mocked(User.deleteOne).mockResolvedValue({} as never)

      await repository.delete('user-1')

      expect(User.deleteOne).toHaveBeenCalledWith({ id: 'user-1' })
    })

    it('should throw an error when delete fails', async () => {
      vi.mocked(User.deleteOne).mockRejectedValue(new Error('DB error'))

      await expect(repository.delete('user-1')).rejects.toThrow('Erro ao deletar usuário')
    })
  })
})
