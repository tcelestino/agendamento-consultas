<script setup lang="ts">
defineProps<{
  links: { link: string; text: string }[]
}>()
</script>
<template>
  <nav class="management__nav">
    <ul class="management__nav-list">
      <li v-for="link in links" :key="link.link">
        <RouterLink :to="link.link" class="management__link">{{ link.text }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.management__nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
}

.management__link {
  display: block;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-link);
  text-decoration: none;
  font-weight: 500;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.management__link:hover {
  border-color: var(--color-border-focus);
  background-color: var(--color-input-bg);
}
</style>
