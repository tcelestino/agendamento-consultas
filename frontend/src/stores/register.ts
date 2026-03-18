import { defineStore } from 'pinia'

interface RegisterState {
  isRegistered: boolean
}

export const useRegisterStore = defineStore('register', {
  state: (): RegisterState => ({ isRegistered: false }),
  actions: {
    setRegistered(value: boolean) {
      this.isRegistered = value
    },
  },
})
