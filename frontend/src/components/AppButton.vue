<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button :type="type" :disabled="disabled" class="app-button">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background-color: var(--color-button);
  border: none;
  border-radius: var(--radius-button);
  padding: 0.75rem 1rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.app-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.app-button:disabled {
  cursor: not-allowed;
  color: var(--color-button-text-disabled);
  background-color: var(--color-button-disabled);
}
</style>
