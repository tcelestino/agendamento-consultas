<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()

const userStore = useUserStore()

const name = ref('')
const isSubmitting = ref(false)
const hasError = ref(false)

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({ name: name.value }),
    })
    if (!response.ok) {
      throw new Error('Erro ao cadastrar especialidade')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível cadastrar a especialidade." />
  <form class="speciality-form" @submit="handleSubmit" novalidate>
    <AppInput
      id="speciality-name"
      label="Nome da especialidade:"
      type="text"
      placeholder="ex.: Cardiologia"
      v-model="name"
    />
    <AppButton type="submit" :disabled="isSubmitting || !name.trim()">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>

<style scoped>
.speciality-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
