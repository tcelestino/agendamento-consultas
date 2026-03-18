<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore } from '@/stores/register'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'
import { getAddress } from '@/utils'

interface Props {
  onSuccess?: () => void
  showEmployeeLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEmployeeLink: true,
})

const router = useRouter()
const registerStore = useRegisterStore()
const showAddressFields = ref(true)
const textRegister = ref('Sou um funcionário')

const hasError = ref({
  message: '',
  isVisible: false,
})
const formFields = reactive({
  name: '',
  email: '',
  password: '',
  address: {
    zipCode: '',
    street: '',
    neighborhood: '',
    city: '',
    state: {
      name: '',
      code: '',
    },
  },
  userType: 'user',
})

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

async function onZipCodeBlur(zipCode: string) {
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
      state: {
        name: state,
        code: stateCode,
      },
    }
  } catch (error) {
    hasError.value = { message: 'Erro ao buscar endereço', isVisible: true }
    formFields.address = {
      zipCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: {
        name: '',
        code: '',
      },
    }
    console.log(error)
  }
}

function toggleAddressFields(e: MouseEvent) {
  showAddressFields.value = !showAddressFields.value
  textRegister.value = showAddressFields.value ? 'Sou um funcionário' : 'Sou um paciente'
  formFields.userType = showAddressFields.value ? 'user' : 'employee'

  if (showAddressFields.value) {
    formFields.address = {
      zipCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: {
        name: '',
        code: '',
      },
    }
  }

  e.preventDefault()
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  const isUser = showAddressFields.value
  hasError.value = { message: '', isVisible: false }

  formFields.address = {
    zipCode: formFields.address.zipCode,
    street: formFields.address.street,
    neighborhood: formFields.address.neighborhood,
    city: formFields.address.city,
    state: {
      name: formFields.address.state.name,
      code: formFields.address.state.code,
    },
  }

  try {
    const payload = {
      name: formFields.name,
      email: formFields.email,
      pass: formFields.password,
      type: formFields.userType,
      address: isUser ? formFields.address : undefined,
    }

    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Erro ao cadastrar usuário')
    }

    if (response.status === 201) {
      if (props.onSuccess) {
        props.onSuccess()
      } else {
        registerStore.setRegistered(true)
        router.push('/login')
      }
    }
  } catch (error) {
    console.log(error)
    hasError.value = {
      message: 'Não foi possível realizar o cadastro. Tente novamente.',
      isVisible: true,
    }
  }
}
</script>

<template>
  <Toast
    v-if="hasError.isVisible"
    :key="hasError.message"
    type="error"
    :message="hasError.message"
  />

  <form class="forms__form" @submit="handleSubmit" novalidate>
    <AppInput
      id="name"
      label="Nome"
      type="text"
      placeholder="Digite seu nome completo"
      v-model="formFields.name"
    />
    <AppInput
      id="email"
      label="Email"
      type="email"
      placeholder="Digite seu email"
      v-model="formFields.email"
    />
    <AppInput
      id="password"
      label="Senha"
      type="password"
      placeholder="Digite uma senha"
      v-model="formFields.password"
    />

    <AppInput id="userType" type="hidden" v-model="formFields.userType" />

    <template v-if="showAddressFields">
      <div class="register-form__row">
        <AppInput
          id="zipcode"
          label="CEP:"
          type="text"
          placeholder="ex.: 41.720-010"
          v-model="zipCodeMasked"
          @blur="onZipCodeBlur(formFields.address.zipCode)"
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
        id="address"
        label="Endereço:"
        type="text"
        v-model="formFields.address.street"
        disabled
      />

      <div class="register-form__row">
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

    <AppButton type="submit">Cadastrar</AppButton>
  </form>

  <a
    v-if="props.showEmployeeLink"
    href="#"
    class="register-form__employee-link"
    @click="toggleAddressFields"
    >{{ textRegister }}</a
  >
</template>

<style scoped>
.register-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.register-form__employee-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-link);
  text-decoration: none;
  text-align: center;
}

.register-form__employee-link:hover {
  text-decoration: underline;
}
</style>
