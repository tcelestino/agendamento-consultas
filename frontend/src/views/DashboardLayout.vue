<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import DashboardHeader from '@/components/DashboardHeader.vue'

const userStore = useUserStore()
const router = useRouter()
const isReady = ref(false)

async function fetchUserData() {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users/me?fields=id,name,type`,
    {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Error ao tentar carregar dados do usuário')
  }
  const { id, name, type } = await response.json()
  userStore.setUserData({ id, name, type })
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    if (!userStore.userData?.id) {
      await fetchUserData()
    }
    isReady.value = true
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
    router.push('/login')
  }
})
</script>

<template>
  <DashboardHeader />
  <RouterView v-if="isReady" />
</template>
