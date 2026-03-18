<script setup lang="ts">
import NavigationList from '@/components/NavigationList.vue'

type NavLink = {
  link: string
  text: string
}

const navLinks: NavLink[] = [
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
    <NavigationList :links="navLinks" />
  </main>
</template>
