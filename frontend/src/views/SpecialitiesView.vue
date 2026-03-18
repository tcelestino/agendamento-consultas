<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import AppButton from '@/components/AppButton.vue'
import SpecialityForm from '@/components/SpecialityForm.vue'

type Speciality = {
  id: string
  name: string
}

const userStore = useUserStore()
const router = useRouter()

const specialities = ref<Speciality[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const removingId = ref<string | null>(null)

async function removeSpeciality(id: string) {
  removingId.value = id
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      console.log(response)
      throw new Error('Erro ao tentar remover especialidade')
    }
    specialities.value = await fetchSpecialities()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    removingId.value = null
  }
}

async function onSpecialityAdded() {
  showForm.value = false
  specialities.value = await fetchSpecialities()
}

async function fetchSpecialities() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar especialidades')
  }
  return await response.json()
}

onMounted(async () => {
  try {
    specialities.value = await fetchSpecialities()
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
    router.push('/')
  }
})
</script>

<template>
  <main class="specialities">
    <div class="specialities__header">
      <h2 class="specialities__title">Gerenciar Especialidades</h2>
      <AppButton type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Adicionar especialidade' }}
      </AppButton>
    </div>

    <SpecialityForm v-if="showForm" :on-success="onSpecialityAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando especialidades...'" />
      </template>

      <template v-else>
        <p v-if="specialities.length === 0" class="specialities__empty">
          Nenhuma especialidade encontrada.
        </p>

        <ul v-else class="specialities__list">
          <li v-for="speciality in specialities" :key="speciality.id" class="specialities__item">
            <span class="specialities__name">{{ speciality.name }}</span>
            <button
              class="specialities__remove-btn"
              :disabled="removingId === speciality.id"
              @click="removeSpeciality(speciality.id)"
            >
              {{ removingId === speciality.id ? 'Removendo...' : 'Remover' }}
            </button>
          </li>
        </ul>
      </template>
    </template>
  </main>
</template>

<style scoped>
.specialities {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.specialities__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.specialities__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.specialities__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.specialities__empty {
  text-align: center;
  color: var(--color-text-muted);
}

.specialities__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.specialities__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.specialities__name {
  font-weight: 600;
  color: var(--color-text);
}

.specialities__remove-btn {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-button);
  background-color: var(--color-error);
  color: #fff;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.specialities__remove-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.specialities__remove-btn:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .specialities {
    padding: 1rem 0;
  }
}
</style>
