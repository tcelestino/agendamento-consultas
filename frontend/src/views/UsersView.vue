<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import UserForm from '@/components/UserForm.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import ItemList from '@/components/ItemList.vue'
import EmptyList from '@/components/EmptyList.vue'

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

const buttonText = {
  add: 'Adicionar usuário',
  cancel: 'Cancelar',
}

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

async function removeUser({ id }: { id: string }) {
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
  <main class="internal-container">
    <ManagementHeader
      title="Usuários"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <UserForm v-if="showForm" mode="register" :on-success="onUserAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando usuários...'" />
      </template>

      <template v-else>
        <EmptyList v-if="users.length === 0" text="Nenhum usuário encontrado." />
        <ItemList v-else :items="users" :removing-id="removingId" @remove="removeUser">
          <template #default="{ item }">
            <span class="users__name">{{ item.name }}</span>
            <span class="users__email">{{ item.email }}</span>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
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
</style>
