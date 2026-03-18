<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()

const userStore = useUserStore()

type Speciality = { id: string; name: string }
type DateEntry = { date: string; time: string }

const specialities = ref<Speciality[]>([])
const selectedSpecialityId = ref('')
const doctorName = ref('')
const dateEntries = ref<DateEntry[]>([{ date: '', time: '' }])
const isSubmitting = ref(false)
const hasError = ref(false)

function addDateEntry() {
  dateEntries.value.push({ date: '', time: '' })
}

function removeDateEntry(index: number) {
  dateEntries.value.splice(index, 1)
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({
        specialityId: selectedSpecialityId.value,
        doctorName: doctorName.value,
        availableDate: dateEntries.value,
      }),
    })
    if (!response.ok) {
      throw new Error('Erro ao cadastrar slot')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}

const isFormValid = () =>
  selectedSpecialityId.value &&
  doctorName.value.trim() &&
  dateEntries.value.every((e) => e.date && e.time)

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` },
    })
    if (!response.ok) throw new Error('Erro ao carregar especialidades')
    specialities.value = await response.json()
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível cadastrar o slot." />
  <form class="slot-form" @submit="handleSubmit" novalidate>
    <AppSelect
      id="slot-speciality"
      label="Especialidade:"
      placeholder="Selecione uma especialidade"
      :options="specialities"
      v-model="selectedSpecialityId"
    />
    <AppInput
      id="slot-doctor"
      label="Nome do médico:"
      type="text"
      placeholder="ex.: Dr. João Silva"
      v-model="doctorName"
    />

    <div class="slot-form__dates">
      <p class="slot-form__dates-label">Horários disponíveis:</p>
      <div
        v-for="(entry, index) in dateEntries"
        :key="index"
        class="slot-form__date-row"
      >
        <AppInput
          :id="`slot-date-${index}`"
          label="Data:"
          type="date"
          v-model="entry.date"
        />
        <AppInput
          :id="`slot-time-${index}`"
          label="Horário:"
          type="time"
          v-model="entry.time"
        />
        <button
          v-if="dateEntries.length > 1"
          type="button"
          class="slot-form__remove-date"
          @click="removeDateEntry(index)"
          aria-label="Remover horário"
        >
          &times;
        </button>
      </div>
      <button type="button" class="slot-form__add-date" @click="addDateEntry">
        + Adicionar horário
      </button>
    </div>

    <AppButton type="submit" :disabled="isSubmitting || !isFormValid()">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>

<style scoped>
.slot-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot-form__dates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slot-form__dates-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-label);
}

.slot-form__date-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.slot-form__remove-date {
  height: 2.5rem;
  width: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background-color: var(--color-input-bg);
  color: var(--color-error);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.slot-form__remove-date:hover {
  border-color: var(--color-error);
}

.slot-form__add-date {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-link);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.slot-form__add-date:hover {
  text-decoration: underline;
}
</style>
