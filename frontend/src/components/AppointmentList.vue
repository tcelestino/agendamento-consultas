<script setup lang="ts">
import { reverseDate } from '@/utils'

export interface AppointmentListProps {
  appointmentsData: {
    id: string
    dateAppointment: {
      date: string
      time: string
    }
    speciality: string
    doctor: { id: string; name: string }
    status?: string
    weather?: {
      condition: {
        text: string
        icon: string
      }
      max: number
      min: number
    }
  }[]
}

defineProps<AppointmentListProps>()
</script>

<template>
  <ul class="appointment-card-list" v-if="appointmentsData.length > 0">
    <li v-for="appointment in appointmentsData" :key="appointment.id">
      <div class="appointment-card">
        <header class="appointment-card__header">
          <time class="appointment-card__datetime"
            >{{ reverseDate(appointment.dateAppointment.date) }} -
            {{ appointment.dateAppointment.time }}</time
          >
        </header>

        <div class="appointment-card__body">
          <div class="appointment-card__main">
            <p class="appointment-card__specialty">{{ appointment.speciality }}</p>
            <p class="appointment-card__doctor">{{ appointment.doctor.name }}</p>
          </div>

          <div v-if="appointment.weather?.condition" class="appointment-card__weather">
            <div class="appointment-card__weather-icon" aria-hidden="true">
              <img
                :src="appointment.weather.condition.icon"
                alt="{{ appointment.weather.condition.text }}"
              />
            </div>
            <div class="appointment-card__weather-info">
              <p class="appointment-card__weather-desc">{{ appointment.weather.condition.text }}</p>
              <p
                v-if="
                  appointment.weather.max !== undefined && appointment.weather.min !== undefined
                "
                class="appointment-card__weather-temp"
              >
                <span>MAX: {{ appointment.weather.max }}</span>
                <span>MIN: {{ appointment.weather.min }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.appointment-card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.appointment-card-list li {
  margin-bottom: 1rem;
}

.appointment-card {
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.appointment-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.appointment-card__datetime {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.appointment-card__status {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.appointment-card__status--ativo {
  color: var(--color-success);
}

.appointment-card__status--inativo {
  color: var(--color-text-muted);
}

.appointment-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  display: inline-block;
}

.appointment-card__body {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.appointment-card__specialty {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text);
}

.appointment-card__doctor {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
}

.appointment-card__weather {
  display: flex;
  gap: 0.375rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.appointment-card__weather span {
  color: var(--color-text);
  font-weight: 700;
}

.appointment-card__weather-icon > img {
  width: 50px;
  object-fit: cover;
}

.appointment-card__weather-desc {
  font-size: 0.788rem;
  color: var(--color-text-muted);
  text-align: right;
}

.appointment-card__weather-temp {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
  font-size: 0.788rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
}
</style>
