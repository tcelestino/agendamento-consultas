<script setup lang="ts">
defineProps({
  text: String,
})
</script>

<template>
  <p class="empty__notice">{{ text }}</p>
</template>

<style scoped>
.empty__notice {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
