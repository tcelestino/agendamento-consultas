<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'

defineProps({
  title: String,
  buttonText: {
    type: Object,
    default: () => ({
      add: 'Adicionar',
      cancel: 'Cancelar',
    }),
  },
  cancelText: String,
  showButton: {
    type: Boolean,
    default: true,
  },
  showForm: {
    type: Boolean,
    default: false,
  },
})

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
