<script setup lang="ts"></script>

<template>
  <main class="management">
    <h2 class="management__title">Gerenciar</h2>
    <nav class="management__nav">
      <ul class="management__nav-list">
        <li>
          <RouterLink to="/dashboard/usuarios" class="management__link"
            >Gerenciar Usuários</RouterLink
          >
        </li>
        <li>
          <RouterLink to="/dashboard/consultas" class="management__link"
            >Gerenciar Consultas</RouterLink
          >
        </li>
        <li>
          <RouterLink to="/dashboard/slots" class="management__link">Gerenciar Agenda</RouterLink>
        </li>
        <li>
          <RouterLink to="/dashboard/especialidades" class="management__link"
            >Gerenciar Especialidades</RouterLink
          >
        </li>
      </ul>
    </nav>
  </main>
</template>

<style scoped>
.management {
  padding: 1.5rem 1rem;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.management__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.management__nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
}

.management__link {
  display: block;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-link);
  text-decoration: none;
  font-weight: 500;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.management__link:hover {
  border-color: var(--color-border-focus);
  background-color: var(--color-input-bg);
}

@media (min-width: 768px) {
  .management {
    padding: 1rem 0;
  }
}
</style>
