<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import AppButton from '@/components/AppButton.vue'
import RegisterForm from '@/components/RegisterForm.vue'

type User = {
  id: string
  name: string
  email: string
}

const userStore = useUserStore()
const router = useRouter()

const users = ref<User[]>([])
const isLoading = ref(true)
const removingId = ref<string | null>(null)
const showForm = ref(false)

async function onUserAdded() {
  showForm.value = false
  users.value = await fetchUsers()
}

async function fetchUsers() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar usuários')
  }
  return await response.json()
}

async function removeUser(id: string) {
  removingId.value = id
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    })
    if (!response.ok) {
      throw new Error('Erro ao tentar remover usuário')
    }
    users.value = await fetchUsers()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    removingId.value = null
  }
}

onMounted(async () => {
  try {
    users.value = await fetchUsers()
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
    router.push('/')
  }
})
</script>

<template>
  <main class="users">
    <div class="users__header">
      <h2 class="users__title">Gerenciar Usuários</h2>
      <AppButton type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Adicionar usuário' }}
      </AppButton>
    </div>

    <RegisterForm
      v-if="showForm"
      :on-success="onUserAdded"
      :show-title="false"
      :show-employee-link="false"
    />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando usuários...'" />
      </template>

      <template v-else>
        <p v-if="users.length === 0" class="users__empty">Nenhum usuário encontrado.</p>

        <ul v-else class="users__list">
          <li v-for="user in users" :key="user.id" class="users__item">
            <div class="users__info">
              <span class="users__name">{{ user.name }}</span>
              <span class="users__email">{{ user.email }}</span>
            </div>
            <button
              class="users__remove-btn"
              :disabled="removingId === user.id"
              @click="removeUser(user.id)"
            >
              {{ removingId === user.id ? 'Removendo...' : 'Remover' }}
            </button>
          </li>
        </ul>
      </template>
    </template>
  </main>
</template>

<style scoped>
.users {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.users__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.users__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.users__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.users__empty {
  text-align: center;
  color: var(--color-text-muted);
}

.users__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.users__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.users__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.users__name {
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.users__email {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.users__remove-btn {
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

.users__remove-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.users__remove-btn:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .users {
    padding: 1rem 0;
  }
}
</style>
