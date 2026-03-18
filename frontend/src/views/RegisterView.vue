<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue'
</script>

<template>
  <main class="register-form">
    <h2 class="register-form__title">Criar uma conta</h2>
    <RegisterForm />
  </main>
</template>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.register-form__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
</style>
