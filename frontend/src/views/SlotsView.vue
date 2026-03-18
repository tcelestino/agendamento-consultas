<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import AppButton from '@/components/AppButton.vue'
import SlotForm from '@/components/SlotForm.vue'

type Slot = {
  id: string
  specialityId: string
  doctor: { id: string; name: string }
  availableDate: { id: string; date: string; time: string; isBooked: boolean }[]
}

const userStore = useUserStore()
const router = useRouter()

const slots = ref<Slot[]>([])
const isLoading = ref(true)
const showForm = ref(false)

async function onSlotAdded() {
  showForm.value = false
  slots.value = await fetchSlots()
}

async function fetchSlots() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar slots')
  }
  return await response.json()
}

function totalSlots(slot: Slot) {
  return slot.availableDate.filter((d) => !d.isBooked).length
}

onMounted(async () => {
  try {
    slots.value = await fetchSlots()
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
    router.push('/')
  }
})
</script>

<template>
  <main class="slots">
    <div class="slots__header">
      <h2 class="slots__title">Agenda</h2>
      <AppButton type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Adicionar agenda' }}
      </AppButton>
    </div>

    <SlotForm v-if="showForm" :on-success="onSlotAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando slots...'" />
      </template>

      <template v-else>
        <p v-if="slots.length === 0" class="slots__empty">Nenhum slot encontrado.</p>

        <ul v-else class="slots__list">
          <li v-for="slot in slots" :key="slot.id" class="slots__item">
            <div class="slots__info">
              <h3 class="slots__doctor">{{ slot.doctor.name }}</h3>
              <p class="slots__meta" v-if="totalSlots(slot) === 0">Nenhum horário disponível</p>
              <p class="slots__meta" v-else>
                {{ totalSlots(slot) }} horário{{ totalSlots(slot) !== 1 ? 's' : '' }} disponíve{{
                  totalSlots(slot) === 1 ? 'l' : 'is'
                }}
              </p>
            </div>
            <span
              class="slots__badge"
              :class="{ 'slots__badge--available': slot.availableDate.some((d) => !d.isBooked) }"
            >
              {{ slot.availableDate.some((d) => !d.isBooked) ? 'Com vagas' : 'Sem vagas' }}
            </span>
          </li>
        </ul>
      </template>
    </template>
  </main>
</template>

<style scoped>
.slots {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.slots__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.slots__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.slots__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.slots__empty {
  text-align: center;
  color: var(--color-text-muted);
}

.slots__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.slots__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.slots__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.slots__doctor {
  font-weight: 600;
  color: var(--color-text);
}

.slots__meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.slots__badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
}

.slots__badge--available {
  background-color: #dcfce7;
  color: var(--color-success);
}

@media (min-width: 768px) {
  .slots {
    padding: 1rem 0;
  }
}
</style>
