<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores'
import Toast from '@/components/Toast.vue'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()

const userStore = useUserStore()

const specialities = ref([])
const professionals = ref([])
const schedules = ref<{ id: string; availableDate: Record<string, string>[] }>({
  id: '',
  availableDate: [],
})

const selectedSpeciality = ref()
const selectedSchedule = ref()
const selectedProfessional = ref()

const hasError = ref({
  speciality: false,
  professional: false,
  schedule: false,
  submitted: false,
})

const toastKeys = ref({
  speciality: 0,
  submitted: 0,
  success: 0,
})

const submitted = ref(false)

async function loadSpecialities() {
  hasError.value.speciality = false
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    })
    if (!response.ok) {
      throw new Error('Error ao carregar especialidades')
    }
    const data = await response.json()

    if (!data.length) {
      return []
    }

    return data
  } catch (error) {
    console.error(error)
    hasError.value.speciality = true
    toastKeys.value.speciality++
    throw error
  }
}

async function loadSchedules(specialityId: string) {
  hasError.value.schedule = false
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}&fields=id,availableDate`,
      {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Error ao carregar datas disponíveis')
    }
    const data = await response.json()
    if (!data.length) {
      return { id: '', availableDate: [] }
    }
    const availableData = data.flatMap((item: { availableDate: Record<string, string>[] }) =>
      item.availableDate.map((available: Record<string, string>) => ({
        id: available.id,
        name: `${available.date} - ${available.time}`,
      })),
    )

    return { id: data[0].id, availableDate: availableData }
  } catch (error) {
    console.error(error)
    hasError.value.schedule = true
    throw error
  }
}
watch(selectedSpeciality, async (newValue) => {
  schedules.value = { id: '', availableDate: [] }
  selectedSchedule.value = undefined
  professionals.value = []
  selectedProfessional.value = undefined
  hasError.value.submitted = false

  if (newValue) {
    const schedulesData = await loadSchedules(newValue)
    schedules.value.id = schedulesData.id
    schedules.value.availableDate = schedulesData.availableDate
  }
})

async function loadProfessionals(specialityId: string) {
  hasError.value.professional = false
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}&fields=doctor`,
      {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Error ao carregar especialidades')
    }
    const data = await response.json()

    return data.map((item: { doctor: Record<string, string> }) => ({
      id: item.doctor.id,
      name: item.doctor.name,
    }))
  } catch (error) {
    console.error(error)
    hasError.value.professional = true
    throw error
  }
}
watch(selectedSchedule, async (newValue) => {
  professionals.value = []
  selectedProfessional.value = undefined
  hasError.value.submitted = false

  if (newValue) {
    professionals.value = await loadProfessionals(selectedSpeciality.value!)
  }
})

function resetForm() {
  selectedSpeciality.value = undefined
  selectedSchedule.value = undefined
  selectedProfessional.value = undefined
  professionals.value = []
  schedules.value = { id: '', availableDate: [] }
}

async function onSave(e: SubmitEvent) {
  e.preventDefault()
  try {
    const payload = {
      slotId: schedules.value.id,
      userId: userStore.userData?.id,
      availableDateId: selectedSchedule.value,
    }
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      hasError.value.submitted = true
      toastKeys.value.submitted++
      throw new Error('Erro ao marcar consulta')
    }
    resetForm()
    submitted.value = true
    toastKeys.value.success++
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value.submitted = true
    toastKeys.value.submitted++
  }
}

onMounted(async () => {
  try {
    specialities.value = await loadSpecialities()
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <Toast
    v-if="hasError.speciality"
    :key="toastKeys.speciality"
    type="error"
    message="Ocorreu um erro ao carregar as especialidades."
  />
  <Toast
    v-if="hasError.submitted"
    :key="toastKeys.submitted"
    type="error"
    message="Ocorreu um erro ao marcar a consulta."
  />
  <Toast
    v-if="submitted"
    :key="toastKeys.success"
    type="success"
    message="Consulta marcada com sucesso!"
  />

  <div class="appointment-form__card">
    <form class="appointment-form__form" @submit="onSave" novalidate>
      <AppSelect
        id="specialty"
        label="Especialidade:"
        :placeholder="
          specialities.length === 0
            ? 'Nenhuma especialidade cadastrada'
            : 'Selecione uma especialidade'
        "
        :options="specialities"
        v-model="selectedSpeciality"
      />
      <AppSelect
        id="schedule"
        label="Horários disponíveis:"
        :placeholder="
          !selectedSpeciality
            ? 'Selecione uma especialidade'
            : schedules.availableDate.length === 0
              ? 'Não existem horários disponíveis'
              : 'Selecione um horário'
        "
        :options="schedules.availableDate"
        v-model="selectedSchedule"
        :disabled="!selectedSpeciality"
      />
      <AppSelect
        id="professional"
        label="Profissionais de saúde:"
        :placeholder="!selectedSchedule ? 'Selecione um horário' : 'Selecione o profissional'"
        :options="professionals"
        v-model="selectedProfessional"
        :disabled="!selectedSchedule"
      />
      <AppInput id="slotId" type="hidden" v-model="schedules.id" />
      <AppButton type="submit" :disabled="!selectedProfessional">Agendar</AppButton>
    </form>
  </div>
</template>

<style scoped>
.appointment-form__card {
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.appointment-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
