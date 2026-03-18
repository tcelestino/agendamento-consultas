<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  id: string
  placeholder?: string
  modelValue?: string
  disabled?: boolean
  options?: Record<string, string>[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const internalValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="form-field">
    <label :for="id" class="form-field__label">{{ label }}</label>
    <select
      :id="id"
      v-model="internalValue"
      :disabled="disabled"
      class="form-field__select"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-label);
}

.form-field__select {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  color: var(--color-text);
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0.625rem 0.875rem;
  width: 100%;
  transition: border-color 0.2s;
  outline: none;
  appearance: auto;
  cursor: pointer;
}

.form-field__select:focus {
  border-color: var(--color-border-focus);
}

.form-field__select:disabled {
  background-color: #f0f0f0;
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
