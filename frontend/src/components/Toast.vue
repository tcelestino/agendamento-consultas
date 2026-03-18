<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  type: 'success' | 'error'
  message: string
}>()

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 7000)
})
</script>

<template>
  <div v-if="visible" :class="['toast', { toast__error: type === 'error' }]">
    {{ message }}
    <button class="toast__close" @click="visible = false">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  background-color: #dcfce7;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.toast__close {
  background-color: transparent;
  border: none;
  color: var(--color-success);
  cursor: pointer;
}

.toast__error {
  background-color: #fee2e2;
  color: var(--color-error);
}
.toast__error .toast__close {
  color: var(--color-error);
}
</style>
