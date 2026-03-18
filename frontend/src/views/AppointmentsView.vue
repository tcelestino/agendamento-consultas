<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import AppointmentAdminForm from '@/components/AppointmentAdminForm.vue'
import EmptyList from '@/components/EmptyList.vue'
import ItemList from '@/components/ItemList.vue'
import { reverseDate } from '@/utils'

type Appointment = {
  id: string
  status: string
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  speciality: string
  userId: string
  slotId: string
}

type User = { id: string; name: string }

const userStore = useUserStore()
const appointments = ref<Appointment[]>([])
const usersMap = ref<Record<string, string>>({})
const isLoading = ref(true)
const removingId = ref<string | null>(null)
const showForm = ref(false)
const buttonText = {
  add: 'Adicionar consulta',
  cancel: 'Cancelar',
}

async function fetchAppointments() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar consultas')
  }
  return await response.json()
}

async function fetchUsers() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar usuários')
  }
  return await response.json()
}

async function onAppointmentAdded() {
  showForm.value = false
  appointments.value = await fetchAppointments()
}

async function removeAppointment({ id, dateAppointment }: Appointment) {
  const availableDateId = dateAppointment.id
  removingId.value = id
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments/${id}?availableDateId=${availableDateId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Erro ao tentar remover consulta')
    }
    appointments.value = await fetchAppointments()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    removingId.value = null
  }
}

onMounted(async () => {
  try {
    const [appointmentsData, usersData] = await Promise.all([fetchAppointments(), fetchUsers()])
    appointments.value = appointmentsData
    usersMap.value = Object.fromEntries(usersData.map((u: User) => [u.id, u.name]))
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
  }
})
</script>

<template>
  <main class="internal-container">
    <ManagementHeader
      title="Consultas"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <AppointmentAdminForm v-if="showForm" :on-success="onAppointmentAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading text="Carregando consultas..." />
      </template>

      <template v-else>
        <EmptyList v-if="appointments.length === 0" text=" Nenhuma consulta agendada" />

        <ItemList
          v-else
          :items="appointments"
          :removing-id="removingId"
          @remove="removeAppointment"
        >
          <template #default="{ item }">
            <ul class="appointments-list">
              <li>
                <strong>Paciente:</strong> {{ usersMap[item.userId] ?? 'Paciente desconhecido' }}
              </li>
              <li>
                <strong>Data da consulta:</strong> {{ reverseDate(item.dateAppointment.date) }} às
                {{ item.dateAppointment.time }}
              </li>
              <li><strong>Profissional de saúde:</strong> {{ item.doctor.name }}</li>
              <li><strong>Especialidade:</strong> {{ item.speciality }}</li>
            </ul>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.appointments-list {
  list-style: none;
  color: var(--color-text);
  font-size: 0.875rem;
}
.appointments-list strong {
  font-weight: 700;
}
</style>
