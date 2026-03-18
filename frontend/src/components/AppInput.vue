<script setup lang="ts">
interface Props {
  label?: string
  id: string
  required?: boolean
  type?: string
  placeholder?: string
  modelValue?: string
  disabled?: boolean
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()

function handleBlur(event: FocusEvent) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  emit('blur')
}
</script>

<template>
  <div class="form-field">
    <template v-if="label">
      <label :for="id" class="form-field__label">{{ label }}</label>
    </template>
    <input
      :id="id"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      class="form-field__input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="handleBlur"
    />
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

.form-field__input {
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
}

.form-field__input::placeholder {
  color: var(--color-text-muted);
}

.form-field__input:focus {
  border-color: var(--color-border-focus);
}

.form-field__input:disabled {
  background-color: #f0f0f0;
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
