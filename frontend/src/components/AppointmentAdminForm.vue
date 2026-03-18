<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'
import { reverseDate } from '@/utils'

interface Props {
  onSuccess?: () => void
}

type User = { id: string; name: string; type: string }
type Speciality = { id: string; name: string }
type AvailableDate = { id: string; date: string; time: string; isBooked: boolean }
type Slot = { id: string; doctor: { id: string; name: string }; availableDate: AvailableDate[] }

const props = defineProps<Props>()
const userStore = useUserStore()
const users = ref<User[]>([])
const specialities = ref<Speciality[]>([])
const slots = ref<Slot[]>([])
const selectedUserId = ref('')
const selectedSpecialityId = ref('')
const selectedSlotId = ref('')
const selectedDateId = ref('')
const isSubmitting = ref(false)
const hasError = ref(false)

const userOptions = computed(() =>
  users.value.filter((u) => u.type === 'user').map((u) => ({ id: u.id, name: u.name })),
)

const slotOptions = computed(() => slots.value.map((s) => ({ id: s.id, name: s.doctor.name })))

const selectedSlot = computed(() => slots.value.find((s) => s.id === selectedSlotId.value))

const dateOptions = computed(() =>
  (selectedSlot.value?.availableDate ?? [])
    .filter((d) => !d.isBooked)
    .map((d) => ({ id: d.id, name: `${reverseDate(d.date)} às ${d.time}` })),
)

const isFormValid = computed(
  () =>
    !!selectedUserId.value &&
    !!selectedSpecialityId.value &&
    !!selectedSlotId.value &&
    !!selectedDateId.value,
)

watch(selectedSpecialityId, async (specialityId) => {
  slots.value = []
  selectedSlotId.value = ''
  selectedDateId.value = ''

  if (!specialityId) return

  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}`,
      { headers: { Authorization: `Bearer ${userStore.accessToken}` } },
    )
    if (!response.ok) throw new Error('Erro ao carregar médicos')
    slots.value = await response.json()
  } catch (error) {
    console.error(error)
    hasError.value = true
  }
})

watch(selectedSlotId, () => {
  selectedDateId.value = ''
})

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({
        slotId: selectedSlotId.value,
        availableDateId: selectedDateId.value,
        userId: selectedUserId.value,
      }),
    })
    if (!response.ok) {
      throw new Error('Erro ao criar consulta')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const [usersRes, specialitiesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
        headers: { Authorization: `Bearer ${userStore.accessToken}` },
      }),
      fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
        headers: { Authorization: `Bearer ${userStore.accessToken}` },
      }),
    ])
    if (!usersRes.ok) throw new Error('Erro ao carregar usuários')
    if (!specialitiesRes.ok) throw new Error('Erro ao carregar especialidades')
    users.value = await usersRes.json()
    specialities.value = await specialitiesRes.json()
  } catch (error) {
    console.error(error)
    hasError.value = true
  }
})
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível criar a consulta." />

  <form class="forms__form" @submit="handleSubmit" novalidate>
    <AppSelect
      id="appointment-user"
      label="Paciente:"
      placeholder="Selecione um paciente"
      :options="userOptions"
      v-model="selectedUserId"
    />
    <AppSelect
      id="appointment-speciality"
      label="Especialidade:"
      :placeholder="
        specialities.length === 0
          ? 'Nenhuma especialidade cadastrada'
          : 'Selecione uma especialidade'
      "
      :options="specialities"
      v-model="selectedSpecialityId"
    />
    <AppSelect
      id="appointment-slot"
      label="Médico:"
      :placeholder="
        !selectedSpecialityId
          ? 'Selecione uma especialidade'
          : slotOptions.length === 0
            ? 'Nenhum médico cadastrado'
            : 'Selecione um médico'
      "
      :options="slotOptions"
      :disabled="!selectedSpecialityId"
      v-model="selectedSlotId"
    />
    <AppSelect
      id="appointment-date"
      label="Data e horário:"
      :placeholder="
        !selectedSlotId
          ? 'Selecione um médico'
          : dateOptions.length === 0
            ? 'Nenhum horário disponível'
            : 'Selecione um horário'
      "
      :options="dateOptions"
      :disabled="!selectedSlotId"
      v-model="selectedDateId"
    />
    <AppButton type="submit" :disabled="isSubmitting || !isFormValid">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>
