<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { getAddress } from '@/utils'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

type UserData = {
  email: string
  name: string
  address: {
    zipCode: string
    state: { code: string }
    street: string
    city: string
    neighborhood: string
  }
}

const userStore = useUserStore()

const user = ref<UserData | null>(null)
const originalUser = ref<UserData | null>(null)

const editing = ref(false)
const showSuccess = ref(false)

const zipCodeMasked = computed({
  get() {
    const digits = (user.value?.address.zipCode ?? '').slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`
  },
  set(value: string) {
    if (!user.value) return
    user.value.address.zipCode = value.replace(/\D/g, '')
  },
})

async function loadUser() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users/${userStore.userData?.id}?fields=name,email,address`,
      {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error('Error ao carregar dados do usuário')
    }

    const data = await response.json()

    if (!data) {
      return null
    }

    return {
      email: data.email,
      name: data.name,
      address: data.address,
    }
  } catch (error) {
    console.error(error)
  }
}

function buildPayload() {
  if (!user.value || !originalUser.value) return {}

  const payload: Record<string, unknown> = {}

  if (user.value.name !== originalUser.value.name) {
    payload.name = user.value.name
  }
  if (user.value.email !== originalUser.value.email) payload.email = user.value.email

  if (userStore.userData?.type === 'user') {
    const orig = originalUser.value.address
    const curr = user.value.address
    const addressChanged =
      curr.zipCode !== orig.zipCode ||
      curr.street !== orig.street ||
      curr.city !== orig.city ||
      curr.neighborhood !== orig.neighborhood ||
      curr.state.code !== orig.state.code

    if (addressChanged) payload.address = curr
  }

  return payload
}

function onEdit(e: Event) {
  e.preventDefault()
  editing.value = true
  showSuccess.value = false
}

async function onZipCodeBlur() {
  if (!user.value) return
  const zipCode = user.value.address.zipCode
  if (zipCode.length < 8) return

  const address = await getAddress(zipCode)
  if (!address) return

  user.value.address.street = address.street
  user.value.address.neighborhood = address.neighborhood
  user.value.address.city = address.city
  user.value.address.state = { code: address.stateCode }
}

async function onSave(e: SubmitEvent) {
  e.preventDefault()

  const payload = buildPayload()
  if (Object.keys(payload).length === 0) {
    editing.value = false
    return
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users/${userStore.userData?.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error('Error ao salvar dados do usuário')
    }

    originalUser.value = JSON.parse(JSON.stringify(user.value))

    if (user.value) {
      userStore.updateUserData({ name: user.value.name, email: user.value.email })
    }

    editing.value = false
    showSuccess.value = true
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  try {
    const userData = await loadUser()
    if (!userData) {
      return
    }
    user.value = userData
    originalUser.value = JSON.parse(JSON.stringify(userData))
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="account-form">
    <Toast v-if="showSuccess" type="success" message="Salvo com sucesso" />
    <h2 class="account-form__title">Minha Conta</h2>
    <p v-if="!user">Usuário não encontrado</p>
    <div class="account-form__card" v-else>
      <form class="account-form__form" @submit="onSave" novalidate>
        <AppInput id="name" label="Nome" type="text" v-model="user.name" :disabled="!editing" />
        <AppInput id="email" label="Email" type="email" v-model="user.email" :disabled="!editing" />

        <template v-if="userStore.userData?.type === 'user'">
          <div class="account-form__row">
            <AppInput
              id="zipCode"
              label="CEP:"
              type="text"
              placeholder="ex.: 41.720-010"
              v-model="zipCodeMasked"
              :disabled="!editing"
              @blur="onZipCodeBlur"
            />
            <AppInput
              id="state"
              label="Estado:"
              type="text"
              v-model="user.address.state.code"
              disabled
            />
          </div>

          <AppInput
            id="street"
            label="Endereço:"
            type="text"
            v-model="user.address.street"
            disabled
          />

          <div class="account-form__row">
            <AppInput id="city" label="Cidade:" type="text" v-model="user.address.city" disabled />
            <AppInput
              id="neighborhood"
              label="Bairro:"
              type="text"
              v-model="user.address.neighborhood"
              disabled
            />
          </div>
        </template>

        <AppButton v-if="!editing" type="button" @click="onEdit">Editar</AppButton>
        <AppButton v-else type="submit" @click="onSave">Salvar</AppButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.account-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.account-form__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.account-form__card {
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.account-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
