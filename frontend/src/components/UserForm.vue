<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore } from '@/stores/register'
import { useUserStore } from '@/stores'
import { getAddress } from '@/utils'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

interface Props {
  mode: 'register' | 'account'
  onSuccess?: () => void
  showEmployeeLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEmployeeLink: true,
})

const router = useRouter()
const registerStore = useRegisterStore()
const userStore = useUserStore()

const isRegister = props.mode === 'register'

// register-only
const showAddressFields = ref(true)
const textRegister = ref('Cadastrar funcionário')

// account-only
const editing = ref(false)
const showSuccess = ref(false)
const userFound = ref(false)

// shared
const hasError = ref({ message: '', isVisible: false })
const formFields = reactive({
  name: '',
  email: '',
  password: '',
  address: {
    zipCode: '',
    street: '',
    neighborhood: '',
    city: '',
    state: { name: '', code: '' },
  },
  userType: 'user',
})

let originalFields: typeof formFields | null = null

const isAddressVisible = computed(() =>
  isRegister ? showAddressFields.value : userStore.userData?.type === 'user',
)

const isFieldDisabled = computed(() => !isRegister && !editing.value)

const zipCodeMasked = computed({
  get() {
    const digits = formFields.address.zipCode.slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`
  },
  set(value: string) {
    formFields.address.zipCode = value.replace(/\D/g, '')
  },
})

async function onZipCodeBlur() {
  const zipCode = formFields.address.zipCode
  if (zipCode.length < 8) return
  hasError.value = { message: '', isVisible: false }
  try {
    const addressData = await getAddress(zipCode)
    if (!addressData) return
    const { street, neighborhood, city, state, stateCode } = addressData
    formFields.address = {
      zipCode,
      street,
      neighborhood,
      city,
      state: { name: state, code: stateCode },
    }
  } catch (error) {
    hasError.value = { message: 'Erro ao buscar endereço', isVisible: true }
    formFields.address = {
      zipCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: { name: '', code: '' },
    }
    console.log(error)
  }
}

function toggleAddressFields(e: MouseEvent) {
  showAddressFields.value = !showAddressFields.value
  textRegister.value = showAddressFields.value ? 'Cadastrar funcionário' : 'Cadastrar paciente'
  formFields.userType = showAddressFields.value ? 'user' : 'employee'
  if (showAddressFields.value) {
    formFields.address = {
      zipCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: { name: '', code: '' },
    }
  }
  e.preventDefault()
}

async function loadUser() {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users/${userStore.userData?.id}?fields=name,email,address`,
    { headers: { Authorization: `Bearer ${userStore.accessToken}` } },
  )
  if (!response.ok) throw new Error('Erro ao carregar dados do usuário')
  const data = await response.json()
  if (!data) return
  formFields.name = data.name
  formFields.email = data.email
  if (data.address) {
    const stateCode = data.address.state?.code ?? ''
    formFields.address = {
      zipCode: data.address.zipCode ?? '',
      street: data.address.street ?? '',
      neighborhood: data.address.neighborhood ?? '',
      city: data.address.city ?? '',
      state: { name: stateCode, code: stateCode },
    }
  }
  originalFields = JSON.parse(JSON.stringify(formFields))
  userFound.value = true
}

function buildPatchPayload() {
  if (!originalFields) return {}
  const payload: Record<string, unknown> = {}
  if (formFields.name !== originalFields.name) payload.name = formFields.name
  if (formFields.email !== originalFields.email) payload.email = formFields.email
  if (userStore.userData?.type === 'user') {
    const orig = originalFields.address
    const curr = formFields.address
    const changed =
      curr.zipCode !== orig.zipCode ||
      curr.street !== orig.street ||
      curr.city !== orig.city ||
      curr.neighborhood !== orig.neighborhood ||
      curr.state.code !== orig.state.code
    if (changed) payload.address = curr
  }
  return payload
}

function onEdit(e: Event) {
  e.preventDefault()
  editing.value = true
  showSuccess.value = false
}

async function handleRegisterSubmit() {
  const payload = {
    name: formFields.name,
    email: formFields.email,
    pass: formFields.password,
    type: formFields.userType,
    address: showAddressFields.value ? formFields.address : undefined,
  }
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('Erro ao cadastrar usuário')
  if (response.status === 201) {
    if (props.onSuccess) {
      props.onSuccess()
    } else {
      registerStore.setRegistered(true)
      router.push('/login')
    }
  }
}

async function handleAccountSubmit() {
  const payload = buildPatchPayload()
  if (Object.keys(payload).length === 0) {
    editing.value = false
    return
  }
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
    if (response.status === 401) {
      userStore.logout()
      return
    }
    throw new Error('Erro ao salvar dados do usuário')
  }
  originalFields = JSON.parse(JSON.stringify(formFields))
  userStore.updateUserData({ name: formFields.name, email: formFields.email })
  editing.value = false
  showSuccess.value = true
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = { message: '', isVisible: false }
  try {
    if (isRegister) {
      await handleRegisterSubmit()
    } else {
      await handleAccountSubmit()
    }
  } catch (error) {
    console.log(error)
    if (!isRegister) {
      userStore.logout()
      return
    }
    hasError.value = {
      message: 'Não foi possível realizar o cadastro. Tente novamente.',
      isVisible: true,
    }
  }
}

onMounted(async () => {
  if (!isRegister) {
    try {
      await loadUser()
    } catch (error) {
      console.error(error)
    }
  }
})
</script>

<template>
  <Toast
    v-if="hasError.isVisible"
    :key="hasError.message"
    type="error"
    :message="hasError.message"
  />
  <Toast v-if="showSuccess" type="success" message="Salvo com sucesso" />

  <p v-if="!isRegister && !userFound">Usuário não encontrado</p>
  <form v-else class="forms__form" @submit="handleSubmit" novalidate>
    <AppInput
      id="name"
      label="Nome"
      type="text"
      placeholder="Digite seu nome completo"
      v-model="formFields.name"
      :disabled="isFieldDisabled"
    />
    <AppInput
      id="email"
      label="Email"
      type="email"
      placeholder="Digite seu email"
      v-model="formFields.email"
      :disabled="isFieldDisabled"
    />

    <template v-if="isRegister">
      <AppInput
        id="password"
        label="Senha"
        type="password"
        placeholder="Digite uma senha"
        v-model="formFields.password"
      />
      <AppInput id="userType" type="hidden" v-model="formFields.userType" />
    </template>

    <template v-if="isAddressVisible">
      <div class="user-form__row">
        <AppInput
          id="zipcode"
          label="CEP:"
          type="text"
          placeholder="ex.: 41.720-010"
          v-model="zipCodeMasked"
          :disabled="isFieldDisabled"
          @blur="onZipCodeBlur"
        />
        <AppInput
          id="state"
          label="Estado:"
          type="text"
          v-model="formFields.address.state.name"
          disabled
        />
        <AppInput id="stateCode" type="hidden" v-model="formFields.address.state.code" />
      </div>

      <AppInput
        id="street"
        label="Endereço:"
        type="text"
        v-model="formFields.address.street"
        disabled
      />

      <div class="user-form__row">
        <AppInput
          id="city"
          label="Cidade:"
          type="text"
          v-model="formFields.address.city"
          disabled
        />
        <AppInput
          id="neighborhood"
          label="Bairro:"
          type="text"
          v-model="formFields.address.neighborhood"
          disabled
        />
      </div>
    </template>

    <template v-if="!isRegister">
      <AppButton v-if="!editing" type="button" @click="onEdit">Editar</AppButton>
      <AppButton v-else type="submit" :disabled="hasError.isVisible">Salvar</AppButton>
    </template>
    <template v-else>
      <AppButton type="submit" :disabled="hasError.isVisible">Cadastrar</AppButton>
    </template>
  </form>

  <a
    v-if="isRegister && props.showEmployeeLink"
    href="#"
    class="user-form__employee-link"
    @click="toggleAddressFields"
    >{{ textRegister }}</a
  >
</template>

<style scoped>
.user-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.user-form__employee-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-link);
  text-decoration: none;
  text-align: center;
}

.user-form__employee-link:hover {
  text-decoration: underline;
}
</style>
