<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
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
const router = useRouter()

const appointments = ref<Appointment[]>([])
const usersMap = ref<Record<string, string>>({})
const isLoading = ref(true)
const removingId = ref<string | null>(null)
const showForm = ref(false)

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

async function removeAppointment(id: string, availableDateId: string) {
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
    router.push('/')
  }
})
</script>

<template>
  <main class="appointments">
    <h2 class="appointments__title">Gerenciar Consultas</h2>
    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading text="Carregando consultas..." />
      </template>

      <template v-else>
        <p v-if="appointments.length === 0" class="appointments__empty">
          Nenhuma consulta encontrada.
        </p>

        <ul v-else class="appointments__list">
          <li v-for="appointment in appointments" :key="appointment.id" class="appointments__item">
            <div class="appointments__info">
              <h3 class="appointments__doctor">{{ appointment.doctor.name }}</h3>
              <p class="appointments__speciality">{{ appointment.speciality }}</p>
              <p class="appointments__date">
                {{ reverseDate(appointment.dateAppointment.date) }} às
                {{ appointment.dateAppointment.time }}
              </p>
              <p class="appointments__patient">
                <strong>Paciente:</strong>
                {{ usersMap[appointment.userId] ?? 'Paciente desconhecido' }}
              </p>
            </div>
            <button
              class="appointments__remove-btn"
              :disabled="removingId === appointment.id"
              @click="removeAppointment(appointment.id, appointment.dateAppointment.id)"
            >
              {{ removingId === appointment.id ? 'Removendo...' : 'Remover' }}
            </button>
          </li>
        </ul>
      </template>
    </template>
  </main>
</template>

<style scoped>
.appointments {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.appointments__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.appointments__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.appointments__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.appointments__empty {
  text-align: center;
  color: var(--color-text-muted);
}

.appointments__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.appointments__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.appointments__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.appointments__patient {
  color: var(--color-text);
  font-size: 0.875rem;
}

.appointments__patient > strong {
  font-weight: 700;
}

.appointments__doctor {
  font-weight: 600;
  color: var(--color-text);
}

.appointments__speciality,
.appointments__date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.appointments__status {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
  text-transform: capitalize;
}

.appointments__status--active {
  color: var(--color-success);
}

.appointments__status--cancelled {
  color: var(--color-error);
}

.appointments__remove-btn {
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

.appointments__remove-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.appointments__remove-btn:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .appointments {
    padding: 1rem 0;
  }
}
</style>
