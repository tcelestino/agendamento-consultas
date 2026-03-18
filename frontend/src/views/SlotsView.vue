<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import SlotForm from '@/components/SlotForm.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import EmptyList from '@/components/EmptyList.vue'
import ItemList from '@/components/ItemList.vue'

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
const buttonText = {
  add: 'Adicionar agenda',
  cancel: 'Cancelar',
}

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
  <main class="internal-container">
    <ManagementHeader
      title="Agenda"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <SlotForm v-if="showForm" :on-success="onSlotAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando slots...'" />
      </template>

      <template v-else>
        <EmptyList v-if="slots.length === 0" text="Nenhum slot encontrado." />

        <ItemList v-else :items="slots" :showRemoveButton="false">
          <template #default="{ item }">
            <div class="slots__item">
              <div class="slots__info">
                <h3 class="slots__doctor">{{ item.doctor.name }}</h3>
                <p class="slots__meta" v-if="totalSlots(item) === 0">Nenhum horário disponível</p>
                <p class="slots__meta" v-else>
                  {{ totalSlots(item) }} horário{{ totalSlots(item) !== 1 ? 's' : '' }} disponíve{{
                    totalSlots(item) === 1 ? 'l' : 'is'
                  }}
                </p>
              </div>
              <span
                class="slots__badge"
                :class="{ 'slots__badge--available': item.availableDate.some((d) => !d.isBooked) }"
              >
                {{ item.availableDate.some((d) => !d.isBooked) ? 'Com vagas' : 'Sem vagas' }}
              </span>
            </div>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.slots__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
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
