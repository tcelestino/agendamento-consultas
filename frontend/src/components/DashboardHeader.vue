<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => {
  return {
    userName: userStore.userData?.name ?? '',
    type: userStore.userData?.type ?? '',
  }
})

function logout(e: Event) {
  e.preventDefault()
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="dashboard-header">
    <div class="dashboard-header__banner">
      <div class="dashboard-header__container">
        <h1 class="dashboard-header__title">Agendamento Consultas</h1>
      </div>
    </div>
    <nav class="dashboard-header__nav">
      <div class="dashboard-header__container dashboard-header__container--nav">
        <span class="dashboard-header__greeting"
          >Olá, <strong>{{ user.userName }}</strong></span
        >

        <ul class="dashboard-header__links">
          <template v-if="user.type === 'user'">
            <li>
              <RouterLink to="/dashboard" class="dashboard-header__link">Consultas</RouterLink>
            </li>
          </template>
          <template v-else>
            <li>
              <RouterLink to="/dashboard/gerenciar" class="dashboard-header__link"
                >Gerenciar</RouterLink
              >
            </li>
          </template>
          <li>
            <RouterLink to="/dashboard/conta" class="dashboard-header__link"
              >Minha Conta</RouterLink
            >
          </li>
          <li>
            <a href="#" class="dashboard-header__link" @click="logout">Sair</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.dashboard-header__banner {
  background: linear-gradient(
    160deg,
    var(--color-gradient-start) 0%,
    var(--color-gradient-end) 100%
  );
  padding: 1.5rem 1rem;
  text-align: center;
}

.dashboard-header__container {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-header__container--nav {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 0.375rem;
  justify-content: space-between;
}

@media (min-width: 640px) {
  .dashboard-header__container--nav {
    gap: 0;
  }
}

.dashboard-header__title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #fff;
}

.dashboard-header__nav {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background-color: #fff;
}

.dashboard-header__greeting {
  font-size: 0.8125rem;
  color: var(--color-text);
}

.dashboard-header__greeting > strong {
  font-weight: 700;
}

.dashboard-header__links {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.dashboard-header__links li {
  list-style: none;
}

.dashboard-header__links li:last-child::after {
  display: none;
}

.dashboard-header__link {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-link);
  text-decoration: none;
}

.dashboard-header__link:hover {
  text-decoration: underline;
}
</style>
