import { defineStore } from 'pinia'

const STORAGE_KEY = 'user_session'

type UserData = {
  id: string
  name: string
  type: string
  email?: string
}

interface UserState {
  isLoggedIn: boolean
  userData?: UserData
  accessToken?: string
}

function loadFromStorage(): Partial<UserState> {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { accessToken } = JSON.parse(stored)
      if (accessToken) return { isLoggedIn: true, accessToken }
    }
  } catch (e: unknown) {
    console.error('Error ao salvar dados para sessão', e)
  }
  return {}
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userData: undefined,
    ...loadFromStorage(),
  }),
  actions: {
    setLogin(data: UserState) {
      const { isLoggedIn, accessToken } = data
      this.isLoggedIn = isLoggedIn
      this.accessToken = accessToken
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken }))
    },
    setUserData(value: UserData) {
      this.userData = value
    },
    updateUserData(value: Pick<UserData, 'name' | 'email'>) {
      if (!this.userData) return
      this.userData = { ...this.userData, ...value }
    },
    logout() {
      this.isLoggedIn = false
      this.accessToken = undefined
      this.userData = undefined
      sessionStorage.removeItem(STORAGE_KEY)
    },
  },
})
