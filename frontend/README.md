# Frontend

Interface web para o sistema de agendamento de consultas médicas. Permite login, cadastro, agendamento de consultas e, para funcionários, gerenciamento de usuários, agenda, especialidades e consultas.

## Stack

- **Vue 3** com Composition API (`<script setup lang="ts">`)
- **TypeScript**
- **Pinia** para gerenciamento de estado
- **Vue Router 5** para navegação
- **Vite** como build tool
- **Vitest** + **Vue Test Utils** para testes unitários

## Como rodar

1. Configure o arquivo `.env` na raiz do projeto:

```env
VITE_AGENDAMENTO_API=http://localhost:3000
```

2. Instale as dependências:

```bash
npm install
```

3. Rode a aplicação em desenvolvimento:

```bash
npm run dev
```

## Comandos

```bash
npm run dev          # Servidor Vite de desenvolvimento
npm run build        # Type-check + build de produção
npm run test:unit    # Testes unitários com Vitest
npm run lint         # oxlint + eslint com auto-fix
npm run format       # Prettier
```

Para rodar um único teste:

```bash
npx vitest run src/components/__tests__/NomeDoComponente.spec.ts
```

## Estrutura do projeto

```
src/
├── views/
│   ├── LoginView.vue               # tela de login
│   ├── RegisterView.vue            # cadastro de usuário
│   ├── DashboardLayout.vue         # layout base das telas autenticadas
│   ├── DashboardView.vue           # painel principal (paciente)
│   ├── ScheduleAppointmentView.vue # formulário de agendamento
│   ├── AccountView.vue             # dados da conta do usuário
│   ├── ManagementView.vue          # menu de gerenciamento (funcionário)
│   ├── UsersView.vue               # gerenciar usuários (funcionário)
│   ├── AppointmentsView.vue        # gerenciar consultas (funcionário)
│   ├── SlotsView.vue               # gerenciar agenda/slots (funcionário)
│   └── SpecialitiesView.vue        # gerenciar especialidades (funcionário)
├── components/
│   ├── __tests__/
│   ├── AppButton.vue               # botão reutilizável
│   ├── AppInput.vue                # campo de texto reutilizável
│   ├── AppSelect.vue               # select reutilizável
│   ├── Header.vue                  # header das telas deslogadas
│   ├── DashboardHeader.vue         # header das telas autenticadas
│   ├── Toast.vue                   # notificações (success/error)
│   ├── Loading.vue                 # indicador de carregamento
│   ├── FormLogin.vue               # formulário de login
│   ├── RegisterForm.vue            # formulário de cadastro
│   ├── AccountForm.vue             # formulário de dados da conta
│   ├── UserForm.vue                # formulário unificado de usuário (registro e conta); toggle "Cadastrar funcionário / Cadastrar paciente"
│   ├── AppointmentList.vue         # lista de agendamentos
│   ├── AppointmentForm.vue         # formulário de agendamento (paciente)
│   ├── AppointmentAdminForm.vue    # formulário de agendamento (funcionário)
│   ├── ItemList.vue                # lista genérica com botão de remoção (emite o item inteiro no evento remove)
│   ├── ManagementHeader.vue        # cabeçalho de telas de gerenciamento (props buttonText e showForm são opcionais)
│   ├── SlotForm.vue                # formulário para criar slots
│   └── SpecialityForm.vue          # formulário para criar especialidades
├── stores/
│   ├── user.ts                     # sessão do usuário (token, dados, login/logout)
│   └── register.ts                 # estado de cadastro concluído
├── router/
│   └── index.ts                    # rotas e configuração de navegação
├── utils/
│   └── index.ts                    # getAddress (ViaCEP), reverseDate
├── assets/
│   ├── base.css                    # variáveis CSS globais (cores, gradiente, fonte Poppins)
│   └── main.css                    # estilos globais da aplicação
├── App.vue
└── main.ts
```

## Rotas

```
/                   → LoginView
/login              → LoginView
/cadastro           → RegisterView
/dashboard          → DashboardView (paciente) ou redireciona para /dashboard/gerenciar (funcionário)
/dashboard/agendar  → ScheduleAppointmentView
/dashboard/conta    → AccountView
/dashboard/gerenciar     → ManagementView (funcionário)
/dashboard/usuarios      → UsersView (funcionário)
/dashboard/consultas     → AppointmentsView (funcionário)
/dashboard/slots         → SlotsView (funcionário)
/dashboard/especialidades → SpecialitiesView (funcionário)
```

As rotas `/dashboard/*` utilizam `DashboardLayout` como componente pai, que valida autenticação e carrega os dados do usuário.

## Autenticação e sessão

A sessão é gerenciada pela store `useUserStore`:

- O access token é persistido em `sessionStorage` e restaurado ao recarregar a página
- Todas as requisições autenticadas enviam `Authorization: Bearer <token>` no header
- O logout limpa o `sessionStorage` e reseta o estado da store

## Padrões

- Path alias `@/` aponta para `src/`
- CSS com `<style scoped>`; variáveis globais em `src/assets/base.css`
- Sem ponto e vírgula, aspas simples, 100 chars por linha (`.prettierrc.json`)
- Linting em sequência: oxlint (`.oxlintrc.json`) → ESLint (`eslint.config.ts`)
