<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'

withDefaults(
  defineProps<{
    title: string
    buttonText?: {
      add: string
      cancel: string
    }
    showButton?: boolean
    showForm?: boolean
  }>(),
  {
    title: '',
    buttonText: () => ({ add: 'Adicionar', cancel: 'Cancelar' }),
    showButton: true,
    showForm: false,
  },
)

const emit = defineEmits<{ 'click:button': [] }>()
</script>

<template>
  <header class="management__header">
    <h2 class="page__title">{{ title }}</h2>
    <AppButton v-if="showButton" type="button" @click="emit('click:button')">
      {{ showForm ? buttonText.cancel : buttonText.add }}
    </AppButton>
  </header>
</template>

<style scoped>
.management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.management__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}
</style>
