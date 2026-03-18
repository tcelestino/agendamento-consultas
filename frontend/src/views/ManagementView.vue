<script setup lang="ts">
import ManagementList from '@/components/ManagementList.vue'

const listLink = [
  {
    link: '/dashboard/usuarios',
    text: 'Gerenciar Usuários',
  },
  {
    link: '/dashboard/consultas',
    text: 'Gerenciar Consultas',
  },
  {
    link: '/dashboard/slots',
    text: 'Gerenciar Agenda',
  },
  {
    link: '/dashboard/especialidades',
    text: 'Gerenciar Especialidades',
  },
]
</script>

<template>
  <main class="internal-container">
    <p>Selecione uma opção abaixo:</p>
    <ManagementList :links="listLink" />
  </main>
</template>
