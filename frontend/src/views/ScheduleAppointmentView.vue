<script setup lang="ts">
import AppointmentForm from '@/components/AppointmentForm.vue'
</script>

<template>
  <main class="schedule-appointment-page">
    <div class="schedule-appointment__content">
      <h2 class="schedule-appointment__title">Marcar Consulta</h2>
      <AppointmentForm />
    </div>
  </main>
</template>

<style scoped>
.schedule-appointment-page {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
}

.schedule-appointment__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.schedule-appointment__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .schedule-appointment-page {
    padding: 1rem 0;
  }
}
</style>
