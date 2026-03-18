<script setup lang="ts"></script>

<template>
  <header class="app-header">
    <div class="app-header__content">
      <h1 class="app-header__title">Agendamento<br />Consulta</h1>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 2rem 1rem 1rem;
  text-align: center;
}

.app-header__content {
  max-width: 640px;
  margin: 0 auto;
}

.app-header__title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  background: linear-gradient(160deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
