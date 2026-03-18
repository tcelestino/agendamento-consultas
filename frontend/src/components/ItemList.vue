<script setup lang="ts" generic="T extends { id: string }">
withDefaults(
  defineProps<{
    items: T[]
    removingId?: string | null
    showRemoveButton?: boolean
  }>(),
  {
    removingId: null,
    showRemoveButton: true,
  },
)

defineEmits<{
  remove: [item: T]
}>()
</script>

<template>
  <ul class="list">
    <li v-for="item in items" :key="item.id" class="list__item">
      <div class="list__content">
        <slot :item="item" />
      </div>
      <button
        v-if="showRemoveButton"
        class="list__remove-btn"
        :disabled="removingId === item.id"
        @click="$emit('remove', item)"
      >
        {{ removingId === item.id ? 'Removendo...' : 'Remover' }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.list__content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  width: 100%;
}

.list__remove-btn {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-button);
  background-color: var(--color-error);
  color: #fff;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.list__remove-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.list__remove-btn:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
  cursor: not-allowed;
}
</style>
