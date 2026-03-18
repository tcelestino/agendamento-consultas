<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import AppointmentList from '@/components/AppointmentList.vue'
import Loading from '@/components/Loading.vue'
import AppButton from '@/components/AppButton.vue'

const userStore = useUserStore()
const router = useRouter()

const appointments = ref([])
const isLoading = ref(true)

async function fetchAppointments() {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments/${userStore.userData?.id}`,
    {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Error ao tentar carregar consultas')
  }
  return await response.json()
}

onMounted(async () => {
  try {
    if (userStore.userData?.type === 'employee') {
      router.push('/dashboard/gerenciar')
      return
    }
    appointments.value = await fetchAppointments()
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
    router.push('/')
  }
})
</script>

<template>
  <main class="dashboard">
    <RouterLink to="/dashboard/agendar" class="dashboard__schedule-btn">
      <AppButton type="button">
        <span class="dashboard__schedule-btn-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Agendar Consulta
        </span>
      </AppButton>
    </RouterLink>

    <div class="dashboard__appointments">
      <template v-if="isLoading">
        <Loading text="Carregando consultas..." />
      </template>
      <template v-if="!isLoading && appointments.length === 0">
        <p class="dashboard__appointments-empty">Nenhuma consulta encontrada.</p>
      </template>

      <AppointmentList :appointmentsData="appointments" />
    </div>
  </main>
</template>

<style scoped>
.dashboard {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dashboard__schedule-btn {
  display: block;
  text-decoration: none;
}

.dashboard__appointments-empty {
  text-align: center;
}

.dashboard__schedule-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
}

.dashboard__appointments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .dashboard {
    padding: 1rem 0;
  }
}
</style>
