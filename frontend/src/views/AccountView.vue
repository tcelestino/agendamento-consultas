<script setup lang="ts">
import AccountForm from '@/components/AccountForm.vue'
</script>

<template>
  <main class="account-page">
    <AccountForm />
  </main>
</template>

<style scoped>
.account-page {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .account-page {
    padding: 1rem 0;
  }
}
</style>
