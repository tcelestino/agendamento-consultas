<script setup lang="ts">
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
</script>

<template>
  <Header v-if="!route.path.startsWith('/dashboard')" />
  <main v-if="!route.path.startsWith('/dashboard')" class="app-main">
    <RouterView />
  </main>
  <RouterView v-else />
</template>

<style scoped>
.app-header {
  padding: 1rem;
  text-align: center;
}

.app-header__content {
  max-width: 640px;
  margin: 0 auto;
  padding: 0;
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .app-header {
    padding: 1.25rem 1rem 0;
  }

  .app-header__title {
    font-size: 2rem;
  }
}

.app-main {
  flex: 1;
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .app-main {
    padding: 2.5rem 1rem;
  }
}
</style>
