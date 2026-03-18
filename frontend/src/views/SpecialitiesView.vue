<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import SpecialityForm from '@/components/SpecialityForm.vue'
import ItemList from '@/components/ItemList.vue'
import EmptyList from '@/components/EmptyList.vue'

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
const buttonText = {
  add: 'Adicionar especialidade',
  cancel: 'Cancelar',
}

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
  <main class="internal-container">
    <ManagementHeader
      title="Especialidades"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <SpecialityForm v-if="showForm" :on-success="onSpecialityAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando especialidades...'" />
      </template>

      <template v-else>
        <EmptyList v-if="specialities.length === 0" text="Nenhuma especialidade encontrada." />
        <ItemList v-else :items="specialities" :removing-id="removingId" @remove="removeSpeciality">
          <template #default="{ item }">
            <span class="specialities__name">{{ item.name }}</span>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.specialities__name {
  font-weight: 600;
  color: var(--color-text);
}
</style>
