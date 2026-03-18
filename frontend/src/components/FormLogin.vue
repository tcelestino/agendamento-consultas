<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore, useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

const registerStore = useRegisterStore()
const userStore = useUserStore()

const router = useRouter()
const email = ref('')
const password = ref('')
const loginProcess = ref({
  hasError: false,
  message: 'Error ao fazer login. Tente novamente',
})

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  registerStore.setRegistered(false)
  loginProcess.value = {
    hasError: false,
    message: '',
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        pass: password.value,
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        loginProcess.value.hasError = true
        loginProcess.value.message = 'Usuário não encontrado'
      } else {
        loginProcess.value.hasError = true
        loginProcess.value.message = 'Ocorreu um erro. Tente novamente'
      }

      throw new Error('Login failed')
    }

    const data = await response.json()
    userStore.setLogin({
      isLoggedIn: true,
      accessToken: data.accessToken,
    })

    router.push('/dashboard')
  } catch (error) {
    loginProcess.value.hasError = true
    loginProcess.value.message = 'Ocorreu um erro. Tente novamente'
    console.error(error)
  }
}
</script>

<template>
  <Toast v-if="registerStore.isRegistered" type="success" message="Cadastro com sucesso!" />
  <Toast v-if="loginProcess.hasError" type="error" :message="loginProcess.message" />
  <main class="login-form">
    <h2 class="login-form__title">Entrar no sistema</h2>

    <form class="login-form__form" @submit="handleSubmit" novalidate>
      <AppInput
        id="email"
        label="Email"
        type="email"
        placeholder="Digite seu email"
        v-model="email"
      />
      <AppInput
        id="password"
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        v-model="password"
      />

      <AppButton type="submit">Entrar</AppButton>
    </form>

    <div class="login-form__links">
      <!-- TODO: implementar reset de senha -->
      <!-- <RouterLink to="/resetar-senha" class="login-form__link">Esqueci a senha</RouterLink> -->
      <p class="login-form__register">
        Não tem cadastro?
        <RouterLink to="/cadastro" class="login-form__link">Criar uma nova conta</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-form__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.login-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-form__link {
  font-size: 0.875rem;
  color: var(--color-link);
  text-decoration: none;
}

.login-form__link:hover {
  text-decoration: underline;
}

.login-form__register {
  font-size: 0.875rem;
  color: var(--color-text);
  display: flex;
  gap: 0.375rem;
  align-items: center;
}
</style>
