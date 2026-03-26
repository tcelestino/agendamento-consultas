# SISTEMA DE AGENDAMENTO DE CONSULTAS MÉDICAS
## Documentação Técnica — Frontend

---

**Instituição:** Faculdade UNIJORGE
**Disciplina:** Desenvolvimento Backend I
**Projeto:** Sistema de Atendimento Inteligente para Clínicas Médicas
**Módulo:** Frontend — SPA Vue 3
**Data:** Março de 2026

---

## SUMÁRIO

1. [Introdução](#1-introdução)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Arquitetura do Frontend](#3-arquitetura-do-frontend)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Configuração de Ambiente](#5-configuração-de-ambiente)
6. [Roteamento](#6-roteamento)
7. [Gerenciamento de Estado (Pinia)](#7-gerenciamento-de-estado-pinia)
8. [Views (Telas)](#8-views-telas)
9. [Componentes Reutilizáveis](#9-componentes-reutilizáveis)
10. [Utilitários](#10-utilitários)
11. [Estilo e Design](#11-estilo-e-design)
12. [Testes](#12-testes)
13. [Build e Execução](#13-build-e-execução)
14. [Fluxos Principais](#14-fluxos-principais)
15. [Referências](#15-referências)

---

## 1. INTRODUÇÃO

Este documento descreve a arquitetura, estrutura de componentes e funcionamento do frontend desenvolvido para o sistema de agendamento de consultas médicas. A aplicação é uma SPA (Single Page Application) construída com Vue 3 e consome a API REST documentada separadamente.

### 1.1 Objetivo

Prover uma interface de usuário responsiva e intuitiva que permita:

- Autenticação de usuários (pacientes e funcionários);
- Registro de novos usuários com preenchimento automático de endereço por CEP;
- Agendamento de consultas médicas com seleção de especialidade, horário e profissional;
- Visualização de consultas agendadas com previsão do tempo;
- Painel administrativo para funcionários gerenciarem usuários, horários, especialidades e agendamentos.

### 1.2 Escopo

O frontend cobre os fluxos de login, cadastro, redefinição de senha (parcialmente implementado), dashboard do paciente, agendamento de consulta e painel de gerenciamento para funcionários. Não contempla funcionalidades de pagamento ou prontuário eletrônico.

---

## 2. TECNOLOGIAS UTILIZADAS

| Categoria | Tecnologia | Versão |
|---|---|---|
| Ambiente de execução | Node.js | ≥ 20.19.0 ou ≥ 22.12.0 |
| Linguagem | TypeScript | ~5.9.3 |
| Framework UI | Vue 3 (Composition API) | ^3.5.28 |
| Gerenciamento de estado | Pinia | ^3.0.4 |
| Roteamento | Vue Router | ^5.0.2 |
| Build tool | Vite | ^7.3.1 |
| Testes unitários | Vitest | ^4.0.18 |
| Utilitário de testes | @vue/test-utils | ^2.4.6 |
| DOM simulado | jsdom | ^28.1.0 |
| Linting rápido | oxlint | ~1.47.0 |
| Linting | ESLint | ^9.39.2 |
| Formatação | Prettier | 3.8.1 |

---

## 3. ARQUITETURA DO FRONTEND

### 3.1 Padrão Composition API

Todo o código Vue utiliza `<script setup lang="ts">`, o padrão moderno do Vue 3 com Composition API. Isso elimina o uso de `Options API` e do mixin pattern, favorecendo composabilidade e type-safety.

### 3.2 Fluxo de Dados

```
View/Component
     ↓ (ação do usuário)
  Store (Pinia)   ←→   API REST (fetch)
     ↓ (estado reativo)
View/Component (atualização automática)
```

### 3.3 Dois Grupos de Layout

As telas são divididas em dois grupos com layouts distintos:

**Telas deslogadas** (`/`, `/login`, `/cadastro`, `/resetar-senha`):
- `App.vue` renderiza o componente `Header` (gradiente roxo) + `<main>` + `<RouterView>`

**Telas do dashboard** (`/dashboard/*`):
- `App.vue` renderiza apenas `<RouterView>`
- Cada view inclui o componente `DashboardHeader` internamente

### 3.4 Módulo de Sistema (ESM)

O projeto utiliza ES Modules, com Vite como bundler. O alias `@/` aponta para `src/`, facilitando imports absolutos.

---

## 4. ESTRUTURA DE DIRETÓRIOS

```
frontend/
├── src/
│   ├── main.ts                       # Entry point: cria app + Pinia + Router
│   ├── App.vue                       # Componente raiz (layout por rota)
│   ├── env.d.ts                      # Declarações de variáveis de ambiente
│   ├── views/                        # Telas da aplicação
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ResetPassView.vue
│   │   ├── DashboardLayout.vue       # Layout base do dashboard
│   │   ├── DashboardView.vue         # Painel do paciente
│   │   ├── ScheduleAppointmentView.vue
│   │   ├── AccountView.vue
│   │   ├── ManagementView.vue        # Menu admin
│   │   ├── UsersView.vue
│   │   ├── SlotsView.vue
│   │   ├── SpecialitiesView.vue
│   │   └── AppointmentsView.vue
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── AppButton.vue
│   │   ├── AppInput.vue
│   │   ├── AppSelect.vue
│   │   ├── FormLogin.vue
│   │   ├── UserForm.vue
│   │   ├── AppointmentForm.vue
│   │   ├── AppointmentList.vue
│   │   ├── AppointmentCard.vue
│   │   ├── AppointmentAdminForm.vue
│   │   ├── Header.vue
│   │   ├── DashboardHeader.vue
│   │   ├── ManagementHeader.vue
│   │   ├── NavigationList.vue
│   │   ├── ItemList.vue
│   │   ├── EmptyList.vue
│   │   ├── Loading.vue
│   │   ├── SlotForm.vue
│   │   ├── SpecialityForm.vue
│   │   ├── Toast.vue
│   │   └── SuccessComponent.vue
│   ├── stores/                       # Pinia stores
│   │   ├── user.ts
│   │   ├── register.ts
│   │   └── index.ts
│   ├── router/                       # Vue Router
│   │   └── index.ts
│   ├── utils/                        # Funções auxiliares
│   │   └── index.ts
│   └── assets/
│       └── base.css                  # Variáveis CSS globais + reset
├── public/
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.ts
├── .oxlintrc.json
├── .prettierrc.json
├── package.json
└── .env                              # Variáveis de ambiente (não versionado)
```

---

## 5. CONFIGURAÇÃO DE AMBIENTE

### 5.1 Arquivo `.env` (frontend/)

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_AGENDAMENTO_API` | URL base da API REST | `http://localhost:3000` |

### 5.2 Uso nos Componentes

```typescript
const API_URL = import.meta.env.VITE_AGENDAMENTO_API
```

### 5.3 Configuração Prettier (`.prettierrc.json`)

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

---

## 6. ROTEAMENTO

O roteamento é gerenciado pelo Vue Router 5, com rotas organizadas em dois grupos.

### 6.1 Rotas Públicas

| Path | View | Descrição |
|---|---|---|
| `/` | Redirect `/login` | Redireciona para login |
| `/login` | `LoginView` | Tela de login |
| `/cadastro` | `RegisterView` | Tela de cadastro |
| `/resetar-senha` | `ResetPassView` | Redefinição de senha |

### 6.2 Rotas Protegidas (Dashboard)

Todas sob o prefixo `/dashboard`, com `DashboardLayout` como componente pai.

| Path | View | Perfil | Descrição |
|---|---|---|---|
| `/dashboard` | `DashboardView` | user / employee | Painel principal com agendamentos |
| `/dashboard/agendar` | `ScheduleAppointmentView` | user / employee | Formulário de agendamento |
| `/dashboard/conta` | `AccountView` | user / employee | Dados da conta |
| `/dashboard/gerenciar` | `ManagementView` | employee | Menu de gerenciamento |
| `/dashboard/usuarios` | `UsersView` | employee | Gerenciar usuários |
| `/dashboard/consultas` | `AppointmentsView` | employee | Gerenciar agendamentos |
| `/dashboard/slots` | `SlotsView` | employee | Gerenciar horários |
| `/dashboard/especialidades` | `SpecialitiesView` | employee | Gerenciar especialidades |

### 6.3 Guarda de Rota

A autenticação é verificada em `DashboardLayout.vue` no hook `onMounted`:
1. Verifica se há `accessToken` em `sessionStorage`;
2. Se sim, faz `GET /users/me` para hidratar os dados do usuário;
3. Se não, redireciona para `/login`.

---

## 7. GERENCIAMENTO DE ESTADO (PINIA)

O Pinia é utilizado no padrão setup store, com `ref()` para estado reativo.

### 7.1 User Store (`src/stores/user.ts`)

Gerencia a sessão do usuário autenticado.

**Estado:**

| Campo | Tipo | Descrição |
|---|---|---|
| `isLoggedIn` | `boolean` | Indica se o usuário está autenticado |
| `userData` | `object \| undefined` | Dados do usuário (`id`, `name`, `type`) |
| `accessToken` | `string \| undefined` | JWT de autenticação |

**Actions:**

| Action | Parâmetros | Descrição |
|---|---|---|
| `setLogin(data)` | `{ accessToken, userData }` | Define login e persiste token no `sessionStorage` |
| `setUserData(userData)` | `{ id, name, type }` | Define os dados do usuário no store |
| `updateUserData(value)` | Partial do userData | Atualiza parcialmente os dados |
| `logout()` | — | Limpa store, remove de `sessionStorage` e redireciona para `/login` |

**Persistência:** o token é armazenado na chave `user_session` do `sessionStorage`. Ao recarregar a página, `DashboardLayout` lê o token e rehidrata o estado.

### 7.2 Register Store (`src/stores/register.ts`)

Controla o estado de conclusão do cadastro de usuário.

**Estado:**

| Campo | Tipo | Descrição |
|---|---|---|
| `isRegistered` | `boolean` | Indica se o cadastro foi concluído |

**Actions:**

| Action | Parâmetros | Descrição |
|---|---|---|
| `setRegistered(value)` | `boolean` | Atualiza o estado de registro |

---

## 8. VIEWS (TELAS)

### 8.1 LoginView

**Path:** `/login`

Tela de autenticação do usuário. Utiliza o componente `FormLogin`, que emite o evento de login com `{ email, pass }`. A view chama `POST /auth/login`, armazena o token via `userStore.setLogin()` e redireciona para `/dashboard`.

### 8.2 RegisterView

**Path:** `/cadastro`

Tela de cadastro de novos usuários. Utiliza o componente `UserForm` no modo `register`. Ao concluir o cadastro com sucesso, exibe o componente `SuccessComponent` e redireciona para o login.

### 8.3 ResetPassView

**Path:** `/resetar-senha`

Tela de redefinição de senha. Parcialmente implementada — exibe a estrutura visual mas o fluxo de reset ainda não foi concluído.

### 8.4 DashboardLayout

**Path:** `/dashboard` (componente pai)

Layout base para todas as telas autenticadas. Responsável por:

1. Verificar autenticação no `onMounted` (token em `sessionStorage`);
2. Hidratar `userData` no store via `GET /api/v1/users/me`;
3. Renderizar `<RouterView>` para as views filhas.

### 8.5 DashboardView

**Path:** `/dashboard`

Painel principal do paciente. Exibe a lista de consultas agendadas.

**Fluxo:**
1. `onMounted`: chama `GET /api/v1/appointments/:userId`;
2. Para cada agendamento, exibe um `AppointmentCard` com dados de clima via `GET /api/v1/infos/weather/:city?date=...`;
3. Exibe `EmptyList` se não houver agendamentos.

### 8.6 ScheduleAppointmentView

**Path:** `/dashboard/agendar`

Formulário de agendamento de consulta. Utiliza o componente `AppointmentForm`.

**Fluxo:**
1. Carrega lista de especialidades disponíveis;
2. Usuário seleciona especialidade → `watcher` carrega horários disponíveis;
3. Usuário seleciona data/horário → `watcher` carrega profissionais disponíveis;
4. Ao confirmar: `POST /api/v1/appointments`;
5. Exibe `Toast` de sucesso ou erro.

### 8.7 AccountView

**Path:** `/dashboard/conta`

Tela de dados da conta. Utiliza o componente `UserForm` no modo `account`.

Permite ao usuário visualizar e editar seus dados pessoais, incluindo endereço. O CEP é consultado automaticamente via `GET /api/v1/infos/address/:zipCode`.

### 8.8 ManagementView

**Path:** `/dashboard/gerenciar`

Menu de acesso rápido ao painel de gerenciamento. Visível apenas para funcionários. Exibe links de navegação para as demais telas administrativas.

### 8.9 UsersView

**Path:** `/dashboard/usuarios`

Gerenciamento de usuários. Exclusivo para funcionários. Lista todos os usuários com opção de remoção.

### 8.10 SlotsView

**Path:** `/dashboard/slots`

Gerenciamento de horários disponíveis. Exclusivo para funcionários. Permite criar novos slots via `SlotForm` e listar os existentes.

### 8.11 SpecialitiesView

**Path:** `/dashboard/especialidades`

Gerenciamento de especialidades. Exclusivo para funcionários. Permite criar especialidades via `SpecialityForm` e remover existentes.

### 8.12 AppointmentsView

**Path:** `/dashboard/consultas`

Gerenciamento de agendamentos. Exclusivo para funcionários. Lista todos os agendamentos com opção de cancelamento.

---

## 9. COMPONENTES REUTILIZÁVEIS

### 9.1 Componentes Base de Formulário

#### AppButton

Botão padronizado da aplicação.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `type` | `string` | `'button'` | Tipo HTML do botão |
| `disabled` | `boolean` | `false` | Desabilita o botão |

#### AppInput

Campo de entrada de texto padronizado.

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | `string` | Sim | Rótulo do campo |
| `id` | `string` | Sim | ID HTML |
| `required` | `boolean` | Não | Indica campo obrigatório |
| `type` | `string` | Não | Tipo input (text, email, password) |
| `placeholder` | `string` | Não | Texto de placeholder |
| `modelValue` | `string` | Sim | Valor do campo (v-model) |
| `disabled` | `boolean` | Não | Desabilita o campo |

**Emits:** `update:modelValue`, `blur`

#### AppSelect

Campo de seleção padronizado.

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | `string` | Sim | Rótulo do campo |
| `id` | `string` | Sim | ID HTML |
| `placeholder` | `string` | Não | Opção inicial vazia |
| `modelValue` | `string` | Sim | Valor selecionado (v-model) |
| `disabled` | `boolean` | Não | Desabilita o campo |
| `options` | `Array<{ value, label }>` | Sim | Lista de opções |

**Emits:** `update:modelValue`

### 9.2 Componentes de Formulário de Domínio

#### FormLogin

Formulário de autenticação com campos de e-mail e senha.

**Emits:** `submit` com `{ email: string, pass: string }`

#### UserForm

Formulário de dados de usuário com dois modos de operação.

| Prop | Tipo | Descrição |
|---|---|---|
| `mode` | `'register' \| 'account'` | Define o comportamento do formulário |

- **register:** campos obrigatórios (nome, e-mail, senha, confirmar senha). Opcionalmente inclui endereço com busca automática de CEP.
- **account:** pré-carrega dados do usuário autenticado, permite edição.

**Busca de CEP:** ao sair do campo CEP (`blur`), chama `GET /api/v1/infos/address/:zipCode` e preenche os campos de endereço automaticamente.

#### AppointmentForm

Formulário de agendamento de consulta em etapas.

1. `AppSelect` de especialidade → dispara `watch` para carregar horários;
2. `AppSelect` de data/horário → dispara `watch` para carregar profissionais;
3. `AppButton` para confirmar agendamento.

#### SlotForm

Formulário para criação de horários disponíveis (admin).

Campos: especialidade, nome do médico, lista de datas/horários.

#### SpecialityForm

Formulário para criação de especialidades médicas (admin).

Campo: nome da especialidade.

#### AppointmentAdminForm

Formulário para agendamento realizado pelo funcionário em nome de um paciente.

### 9.3 Componentes de Exibição

#### AppointmentCard

Card de consulta agendada com dados meteorológicos opcionais.

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `appointment` | `IAppointmentData` | Sim | Dados da consulta |
| `weatherDescription` | `string` | Não | Descrição do tempo no dia |
| `weatherMax` | `number` | Não | Temperatura máxima |
| `weatherMin` | `number` | Não | Temperatura mínima |

#### AppointmentList

Renderiza uma lista de `AppointmentCard`. Para cada consulta, faz a requisição de clima e passa os dados ao card.

#### ItemList

Lista genérica com suporte a remoção de itens.

| Prop | Tipo | Descrição |
|---|---|---|
| `items` | `Array` | Lista de itens |
| `labelKey` | `string` | Campo a exibir como label |

**Emits:** `remove` com o ID do item

#### EmptyList

Componente de estado vazio para listas sem itens.

| Prop | Tipo | Descrição |
|---|---|---|
| `message` | `string` | Texto exibido |

#### NavigationList

Lista de links de navegação do painel administrativo.

#### SuccessComponent

Estado de sucesso genérico, exibido após operações concluídas.

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título da mensagem |
| `message` | `string` | Descrição complementar |

### 9.4 Componentes de Layout

#### Header

Cabeçalho utilizado nas telas deslogadas. Exibe logo da aplicação com gradiente roxo sobre fundo branco.

#### DashboardHeader

Cabeçalho utilizado nas telas autenticadas. Exibe banner com gradiente roxo e barra de navegação interna do dashboard.

#### ManagementHeader

Cabeçalho específico para as telas administrativas.

### 9.5 Componentes Utilitários

#### Toast

Notificação temporária de feedback ao usuário.

| Prop | Tipo | Descrição |
|---|---|---|
| `type` | `'success' \| 'error'` | Estilo visual da notificação |
| `message` | `string` | Texto exibido |

**Comportamento:** auto-fecha após 7 segundos.

#### Loading

Spinner de carregamento exibido durante requisições assíncronas.

---

## 10. UTILITÁRIOS

### 10.1 `src/utils/index.ts`

#### getAddress

```typescript
async function getAddress(zipCode: string): Promise<IAddressResponse>
```

Realiza `GET /api/v1/infos/address/:zipCode` e retorna os dados de endereço formatados. Utilizado nos formulários de cadastro e edição de conta.

#### reverseDate

```typescript
function reverseDate(date: string): string
// Exemplo: "2024-12-25" → "25/12/2024"
```

Converte data do formato ISO (`YYYY-MM-DD`) para o formato brasileiro (`DD/MM/YYYY`). Utilizado na exibição de datas nos cards de agendamento.

---

## 11. ESTILO E DESIGN

### 11.1 Variáveis CSS Globais (`src/assets/base.css`)

O arquivo `base.css` define variáveis CSS customizadas e o reset global utilizado por todos os componentes.

| Variável | Descrição |
|---|---|
| `--color-primary` | Cor principal (roxo) |
| `--gradient-header` | Gradiente do cabeçalho |
| `--font-family` | Fonte Poppins |

A fonte **Poppins** é importada via Google Fonts no arquivo `index.html`.

### 11.2 Scoped CSS

Todos os componentes utilizam `<style scoped>`, garantindo que os estilos não vazem para outros componentes.

### 11.3 Padrão de Código (Prettier)

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

### 11.4 Linting em Sequência

1. **oxlint** (`.oxlintrc.json`) — verificações rápidas baseadas em Rust;
2. **ESLint** (`eslint.config.ts`) — verificações TypeScript e Vue.

```bash
npm run lint   # Executa oxlint e depois ESLint com auto-fix
```

---

## 12. TESTES

### 12.1 Configuração

Os testes são executados com **Vitest** e **@vue/test-utils**, simulando o DOM com **jsdom**.

**`vitest.config.ts`:** define o ambiente `jsdom` para todos os testes.

### 12.2 Estrutura

```
src/
└── components/
    └── __tests__/
        └── NomeDoComponente.spec.ts
```

### 12.3 Padrão de Teste

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '../AppButton.vue'

describe('AppButton', () => {
  it('deve renderizar o slot padrão', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Clique aqui' }
    })
    expect(wrapper.text()).toBe('Clique aqui')
  })
})
```

### 12.4 Comando

```bash
npm run test:unit
# ou um arquivo específico:
npx vitest run src/components/__tests__/NomeDoComponente.spec.ts
```

---

## 13. BUILD E EXECUÇÃO

### 13.1 Instalação

```bash
cd frontend
npm install
```

### 13.2 Desenvolvimento

```bash
# Configurar variável de ambiente
cp frontend/.env.example frontend/.env
# Editar VITE_AGENDAMENTO_API com a URL da API

npm run dev
# Servidor disponível em http://localhost:5173
```

### 13.3 Build de Produção

```bash
npm run build
# Executa vue-tsc (type-check) + vite build
# Artefatos gerados em frontend/dist/
```

### 13.4 Preview da Build

```bash
npm run preview
```

### 13.5 Formatação

```bash
npm run format   # Prettier em todos os arquivos
```

---

## 14. FLUXOS PRINCIPAIS

### 14.1 Fluxo de Login

```
1. Usuário acessa /login
2. Preenche e-mail e senha no FormLogin
3. FormLogin emite evento 'submit' com { email, pass }
4. LoginView: POST /api/v1/auth/login
5. Resposta: { accessToken }
6. userStore.setLogin({ accessToken })
   → Salva token em sessionStorage['user_session']
7. router.push('/dashboard')
8. DashboardLayout.onMounted:
   → GET /api/v1/users/me?fields=id,name,type
   → userStore.setUserData(userData)
```

### 14.2 Fluxo de Cadastro

```
1. Usuário acessa /cadastro
2. Preenche UserForm (modo 'register')
3. Ao digitar CEP e sair do campo (blur):
   → getAddress(zipCode) via GET /api/v1/infos/address/:zipCode
   → Preenche campos de endereço automaticamente
4. Ao submeter: POST /api/v1/users
5. Sucesso: registerStore.setRegistered(true)
             Exibe SuccessComponent
             Redireciona para /login
```

### 14.3 Fluxo de Agendamento

```
1. Usuário acessa /dashboard/agendar
2. AppointmentForm carrega especialidades:
   → GET /api/v1/specialities
3. Usuário seleciona especialidade
   → watch: GET /api/v1/slots?specialityId=<id>&fields=id,availableDate
   → Popula opções de data/horário
4. Usuário seleciona data/horário
   → watch: filtra profissionais disponíveis no slot
5. Usuário clica em "Agendar"
   → POST /api/v1/appointments { slotId, availableDateId }
6. Sucesso: Toast('Consulta agendada com sucesso')
   Erro: Toast('Erro ao agendar consulta')
```

### 14.4 Fluxo de Visualização com Clima

```
1. Usuário acessa /dashboard
2. DashboardView: GET /api/v1/appointments/:userId
3. AppointmentList renderiza para cada agendamento:
   → GET /api/v1/infos/weather/:city?date=YYYY-MM-DD
   → Passa { weatherDescription, weatherMax, weatherMin } para AppointmentCard
4. AppointmentCard exibe:
   - Especialidade, médico, data, hora
   - Ícone e descrição do tempo
   - Temperatura máxima e mínima
```

### 14.5 Fluxo de Logout

```
1. Usuário clica em "Sair"
2. POST /api/v1/auth/logout (com Bearer token)
3. userStore.logout():
   → isLoggedIn = false
   → userData = undefined
   → accessToken = undefined
   → sessionStorage.removeItem('user_session')
4. router.push('/login')
```

---

## 15. CÓDIGO-FONTE

Esta seção apresenta o código-fonte completo do frontend, organizado por tipo de arquivo.

---

### 15.1 Entry Point e Raiz

#### `src/main.ts`
```typescript
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

#### `src/App.vue`
```vue
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
```

---

### 15.2 Estilos Globais

#### `src/assets/base.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  --font-family: 'Poppins', sans-serif;

  --color-gradient-start: #4f46e5;
  --color-gradient-end: #9333ea;

  --color-primary: #7c3aed;
  --color-button: #e91e8c;
  --color-button-hover: #c41678;

  --color-input-bg: #f9f9f9;
  --color-border: #e5e7eb;
  --color-border-focus: #9333ea;

  --color-text: #1f2937;
  --color-text-muted: #9ca3af;
  --color-label: #374151;
  --color-link: #4f46e5;

  --color-success: #16a34a;
  --color-error: #dc2626;

  --radius-input: 6px;
  --radius-button: 6px;

  --color-button-disabled: #f0f0f0;
  --color-button-text-disabled: #6c6c6f;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-weight: normal;
}

body {
  min-height: 100vh;
  line-height: 1.6;
  font-family: var(--font-family);
  color: var(--color-text);
  background-color: #fff;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### 15.3 Roteamento

#### `src/router/index.ts`
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardLayout from '@/views/DashboardLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import ScheduleAppointmentView from '@/views/ScheduleAppointmentView.vue'
import AccountView from '@/views/AccountView.vue'
import ManagementView from '@/views/ManagementView.vue'
import UsersView from '@/views/UsersView.vue'
import SlotsView from '@/views/SlotsView.vue'
import SpecialitiesView from '@/views/SpecialitiesView.vue'
import AppointmentsView from '@/views/AppointmentsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LoginView,
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/cadastro',
      component: RegisterView,
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: '',
          component: DashboardView,
        },
        {
          path: 'agendar',
          component: ScheduleAppointmentView,
        },
        {
          path: 'conta',
          component: AccountView,
        },
        {
          path: 'gerenciar',
          component: ManagementView,
        },
        {
          path: 'usuarios',
          component: UsersView,
        },
        {
          path: 'consultas',
          component: AppointmentsView,
        },
        {
          path: 'slots',
          component: SlotsView,
        },
        {
          path: 'especialidades',
          component: SpecialitiesView,
        },
      ],
    },
  ],
})

export default router
```

---

### 15.4 Stores (Pinia)

#### `src/stores/user.ts`
```typescript
import { defineStore } from 'pinia'
import router from '@/router'

const STORAGE_KEY = 'user_session'

type UserData = {
  id: string
  name: string
  type: string
  email?: string
}

interface UserState {
  isLoggedIn: boolean
  userData?: UserData
  accessToken?: string
}

function loadFromStorage(): Partial<UserState> {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { accessToken } = JSON.parse(stored)
      if (accessToken) return { isLoggedIn: true, accessToken }
    }
  } catch (e: unknown) {
    console.error('Error ao salvar dados para sessão', e)
  }
  return {}
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userData: undefined,
    ...loadFromStorage(),
  }),
  actions: {
    setLogin(data: UserState) {
      const { isLoggedIn, accessToken } = data
      this.isLoggedIn = isLoggedIn
      this.accessToken = accessToken
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken }))
    },
    setUserData(value: UserData) {
      this.userData = value
    },
    updateUserData(value: Pick<UserData, 'name' | 'email'>) {
      if (!this.userData) return
      this.userData = { ...this.userData, ...value }
    },
    logout() {
      this.isLoggedIn = false
      this.accessToken = undefined
      this.userData = undefined
      sessionStorage.removeItem(STORAGE_KEY)
      router.push('/')
    },
  },
})
```

#### `src/stores/register.ts`
```typescript
import { defineStore } from 'pinia'

interface RegisterState {
  isRegistered: boolean
}

export const useRegisterStore = defineStore('register', {
  state: (): RegisterState => ({ isRegistered: false }),
  actions: {
    setRegistered(value: boolean) {
      this.isRegistered = value
    },
  },
})
```

---

### 15.5 Utilitários

#### `src/utils/index.ts`
```typescript
export async function getAddress(zipCode: string) {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/infos/address/${zipCode}/`,
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar endereço')
  }

  const { street, neighborhood, city, state, stateCode } = await response.json()

  return { street, neighborhood, city, state, stateCode }
}

export function reverseDate(date: string) {
  return date.split('-').reverse().join('/')
}
```

---

### 15.6 Views

#### `src/views/LoginView.vue`
```vue
<script setup lang="ts">
import FormLogin from '@/components/FormLogin.vue'
</script>

<template>
  <div class="page-container">
    <h2 class="page__title">Entrar no sistema</h2>
    <FormLogin />
  </div>
</template>
```

#### `src/views/RegisterView.vue`
```vue
<script setup lang="ts">
import UserForm from '@/components/UserForm.vue'
</script>

<template>
  <div class="page-container">
    <h2 class="page__title">Criar uma conta</h2>
    <UserForm mode="register" />
  </div>
</template>
```

#### `src/views/DashboardLayout.vue`
```vue
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
```

#### `src/views/DashboardView.vue`
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import AppointmentList from '@/components/AppointmentList.vue'
import Loading from '@/components/Loading.vue'
import AppButton from '@/components/AppButton.vue'

const userStore = useUserStore()
const router = useRouter()

const appointments = ref([])
const isLoading = ref(true)

async function fetchAppointments() {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments/${userStore.userData?.id}`,
    {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Error ao tentar carregar consultas')
  }
  return await response.json()
}

onMounted(async () => {
  try {
    if (userStore.userData?.type === 'employee') {
      router.push('/dashboard/gerenciar')
      return
    }
    appointments.value = await fetchAppointments()
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
    <RouterLink to="/dashboard/agendar" class="dashboard__schedule-btn">
      <AppButton type="button">
        <span class="dashboard__schedule-btn-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Agendar Consulta
        </span>
      </AppButton>
    </RouterLink>

    <div class="dashboard__appointments">
      <template v-if="isLoading">
        <Loading text="Carregando consultas..." />
      </template>
      <template v-if="!isLoading && appointments.length === 0">
        <p class="dashboard__appointments-empty">Nenhuma consulta encontrada.</p>
      </template>

      <AppointmentList :appointmentsData="appointments" />
    </div>
  </main>
</template>

<style scoped>
.dashboard__schedule-btn {
  display: block;
  text-decoration: none;
}

.dashboard__appointments-empty {
  text-align: center;
}

.dashboard__schedule-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
}

.dashboard__appointments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
```

#### `src/views/ScheduleAppointmentView.vue`
```vue
<script setup lang="ts">
import AppointmentForm from '@/components/AppointmentForm.vue'
</script>

<template>
  <main class="internal-container">
    <h2 class="page__title">Marcar Consulta</h2>
    <AppointmentForm />
  </main>
</template>
```

#### `src/views/AccountView.vue`
```vue
<script setup lang="ts">
import UserForm from '@/components/UserForm.vue'
</script>

<template>
  <main class="internal-container">
    <h2 class="page__title">Minha Conta</h2>
    <UserForm mode="account" />
  </main>
</template>
```

#### `src/views/ManagementView.vue`
```vue
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
```

#### `src/views/UsersView.vue`
```vue
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
```

#### `src/views/SlotsView.vue`
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import SlotForm from '@/components/SlotForm.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import EmptyList from '@/components/EmptyList.vue'
import ItemList from '@/components/ItemList.vue'

type Slot = {
  id: string
  specialityId: string
  doctor: { id: string; name: string }
  availableDate: { id: string; date: string; time: string; isBooked: boolean }[]
}

const userStore = useUserStore()
const router = useRouter()
const slots = ref<Slot[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const buttonText = {
  add: 'Adicionar agenda',
  cancel: 'Cancelar',
}

async function onSlotAdded() {
  showForm.value = false
  slots.value = await fetchSlots()
}

async function fetchSlots() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar slots')
  }
  return await response.json()
}

function totalSlots(slot: Slot) {
  return slot.availableDate.filter((d) => !d.isBooked).length
}

onMounted(async () => {
  try {
    slots.value = await fetchSlots()
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
      title="Agenda"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <SlotForm v-if="showForm" :on-success="onSlotAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando slots...'" />
      </template>

      <template v-else>
        <EmptyList v-if="slots.length === 0" text="Nenhum slot encontrado." />

        <ItemList v-else :items="slots" :showRemoveButton="false">
          <template #default="{ item }">
            <div class="slots__item">
              <div class="slots__info">
                <h3 class="slots__doctor">{{ item.doctor.name }}</h3>
                <p class="slots__meta" v-if="totalSlots(item) === 0">Nenhum horário disponível</p>
                <p class="slots__meta" v-else>
                  {{ totalSlots(item) }} horário{{ totalSlots(item) !== 1 ? 's' : '' }} disponíve{{
                    totalSlots(item) === 1 ? 'l' : 'is'
                  }}
                </p>
              </div>
              <span
                class="slots__badge"
                :class="{ 'slots__badge--available': item.availableDate.some((d) => !d.isBooked) }"
              >
                {{ item.availableDate.some((d) => !d.isBooked) ? 'Com vagas' : 'Sem vagas' }}
              </span>
            </div>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.slots__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.slots__doctor {
  font-weight: 600;
  color: var(--color-text);
}

.slots__meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.slots__badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
}

.slots__badge--available {
  background-color: #dcfce7;
  color: var(--color-success);
}
</style>
```

#### `src/views/SpecialitiesView.vue`
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import SpecialityForm from '@/components/SpecialityForm.vue'
import ItemList from '@/components/ItemList.vue'
import EmptyList from '@/components/EmptyList.vue'

type Speciality = {
  id: string
  name: string
}

const userStore = useUserStore()
const router = useRouter()
const specialities = ref<Speciality[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const removingId = ref<string | null>(null)
const buttonText = {
  add: 'Adicionar especialidade',
  cancel: 'Cancelar',
}

async function removeSpeciality({ id }: { id: string }) {
  removingId.value = id
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Erro ao tentar remover especialidade')
    }
    specialities.value = await fetchSpecialities()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    removingId.value = null
  }
}

async function onSpecialityAdded() {
  showForm.value = false
  specialities.value = await fetchSpecialities()
}

async function fetchSpecialities() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar especialidades')
  }
  return await response.json()
}

onMounted(async () => {
  try {
    specialities.value = await fetchSpecialities()
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
      title="Especialidades"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <SpecialityForm v-if="showForm" :on-success="onSpecialityAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading :text="'Carregando especialidades...'" />
      </template>

      <template v-else>
        <EmptyList v-if="specialities.length === 0" text="Nenhuma especialidade encontrada." />
        <ItemList v-else :items="specialities" :removing-id="removingId" @remove="removeSpeciality">
          <template #default="{ item }">
            <span class="specialities__name">{{ item.name }}</span>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.specialities__name {
  font-weight: 600;
  color: var(--color-text);
}
</style>
```

#### `src/views/AppointmentsView.vue`
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores'
import Loading from '@/components/Loading.vue'
import ManagementHeader from '@/components/ManagementHeader.vue'
import AppointmentAdminForm from '@/components/AppointmentAdminForm.vue'
import EmptyList from '@/components/EmptyList.vue'
import ItemList from '@/components/ItemList.vue'
import { reverseDate } from '@/utils'

type Appointment = {
  id: string
  status: string
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  speciality: string
  userId: string
  slotId: string
}

type User = { id: string; name: string }

const userStore = useUserStore()
const appointments = ref<Appointment[]>([])
const usersMap = ref<Record<string, string>>({})
const isLoading = ref(true)
const removingId = ref<string | null>(null)
const showForm = ref(false)
const buttonText = {
  add: 'Adicionar consulta',
  cancel: 'Cancelar',
}

async function fetchAppointments() {
  const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao tentar carregar consultas')
  }
  return await response.json()
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

async function onAppointmentAdded() {
  showForm.value = false
  appointments.value = await fetchAppointments()
}

async function removeAppointment({ id, dateAppointment }: Appointment) {
  const availableDateId = dateAppointment.id
  removingId.value = id
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments/${id}?availableDateId=${availableDateId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Erro ao tentar remover consulta')
    }
    appointments.value = await fetchAppointments()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    removingId.value = null
  }
}

onMounted(async () => {
  try {
    const [appointmentsData, usersData] = await Promise.all([fetchAppointments(), fetchUsers()])
    appointments.value = appointmentsData
    usersMap.value = Object.fromEntries(usersData.map((u: User) => [u.id, u.name]))
    isLoading.value = false
  } catch (error: unknown) {
    console.error(error)
    userStore.logout()
  }
})
</script>

<template>
  <main class="internal-container">
    <ManagementHeader
      title="Consultas"
      :buttonText="buttonText"
      :show-form="showForm"
      @click:button="showForm = !showForm"
    />

    <AppointmentAdminForm v-if="showForm" :on-success="onAppointmentAdded" />

    <template v-if="!showForm">
      <template v-if="isLoading">
        <Loading text="Carregando consultas..." />
      </template>

      <template v-else>
        <EmptyList v-if="appointments.length === 0" text=" Nenhuma consulta agendada" />

        <ItemList
          v-else
          :items="appointments"
          :removing-id="removingId"
          @remove="removeAppointment"
        >
          <template #default="{ item }">
            <ul class="appointments-list">
              <li>
                <strong>Paciente:</strong> {{ usersMap[item.userId] ?? 'Paciente desconhecido' }}
              </li>
              <li>
                <strong>Data da consulta:</strong> {{ reverseDate(item.dateAppointment.date) }} às
                {{ item.dateAppointment.time }}
              </li>
              <li><strong>Profissional de saúde:</strong> {{ item.doctor.name }}</li>
              <li><strong>Especialidade:</strong> {{ item.speciality }}</li>
            </ul>
          </template>
        </ItemList>
      </template>
    </template>
  </main>
</template>

<style scoped>
.appointments-list {
  list-style: none;
  color: var(--color-text);
  font-size: 0.875rem;
}
.appointments-list strong {
  font-weight: 700;
}
</style>
```

---

### 15.7 Componentes

#### `src/components/AppButton.vue`
```vue
<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button :type="type" :disabled="disabled" class="app-button">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background-color: var(--color-button);
  border: none;
  border-radius: var(--radius-button);
  padding: 0.75rem 1rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.app-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.app-button:disabled {
  cursor: not-allowed;
  color: var(--color-button-text-disabled);
  background-color: var(--color-button-disabled);
}
</style>
```

#### `src/components/AppInput.vue`
```vue
<script setup lang="ts">
interface Props {
  label?: string
  id: string
  required?: boolean
  type?: string
  placeholder?: string
  modelValue?: string
  disabled?: boolean
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()

function handleBlur(event: FocusEvent) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  emit('blur')
}
</script>

<template>
  <div class="form-field">
    <template v-if="label">
      <label :for="id" class="form-field__label">{{ label }}</label>
    </template>
    <input
      :id="id"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      class="form-field__input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="handleBlur"
    />
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-label);
}

.form-field__input {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  color: var(--color-text);
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0.625rem 0.875rem;
  width: 100%;
  transition: border-color 0.2s;
  outline: none;
}

.form-field__input:focus {
  border-color: var(--color-border-focus);
}

.form-field__input:disabled {
  background-color: #f0f0f0;
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
```

#### `src/components/AppSelect.vue`
```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  id: string
  placeholder?: string
  modelValue?: string
  disabled?: boolean
  options?: Record<string, string>[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const internalValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="form-field">
    <label :for="id" class="form-field__label">{{ label }}</label>
    <select
      :id="id"
      v-model="internalValue"
      :disabled="disabled"
      class="form-field__select"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.form-field__select {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  color: var(--color-text);
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0.625rem 0.875rem;
  width: 100%;
  transition: border-color 0.2s;
  outline: none;
  appearance: auto;
  cursor: pointer;
}

.form-field__select:focus {
  border-color: var(--color-border-focus);
}

.form-field__select:disabled {
  background-color: #f0f0f0;
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
```

#### `src/components/Header.vue`
```vue
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
```

#### `src/components/DashboardHeader.vue`
```vue
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

.dashboard-header__links {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0;
  margin: 0;
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
```

#### `src/components/FormLogin.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore, useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

const registerStore = useRegisterStore()
const userStore = useUserStore()

const router = useRouter()
const email = ref('')
const password = ref('')
const loginProcess = ref({
  hasError: false,
  message: 'Error ao fazer login. Tente novamente',
})

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  registerStore.setRegistered(false)
  loginProcess.value = {
    hasError: false,
    message: '',
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        pass: password.value,
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        loginProcess.value.hasError = true
        loginProcess.value.message = 'Usuário não encontrado'
      } else {
        loginProcess.value.hasError = true
        loginProcess.value.message = 'Ocorreu um erro. Tente novamente'
      }

      throw new Error('Login failed')
    }

    const data = await response.json()
    userStore.setLogin({
      isLoggedIn: true,
      accessToken: data.accessToken,
    })

    router.push('/dashboard')
  } catch (error) {
    loginProcess.value.hasError = true
    loginProcess.value.message = 'Ocorreu um erro. Tente novamente'
    console.error(error)
  }
}
</script>

<template>
  <Toast v-if="registerStore.isRegistered" type="success" message="Cadastro com sucesso!" />
  <Toast v-if="loginProcess.hasError" type="error" :message="loginProcess.message" />
  <form class="forms__form" @submit="handleSubmit" novalidate>
    <AppInput
      id="email"
      label="Email"
      type="email"
      placeholder="Digite seu email"
      v-model="email"
    />
    <AppInput
      id="password"
      label="Senha"
      type="password"
      placeholder="Digite sua senha"
      v-model="password"
    />

    <AppButton type="submit">Entrar</AppButton>
  </form>

  <div class="login-form__links">
    <p class="login-form__register">
      Não tem cadastro?
      <RouterLink to="/cadastro" class="login-form__link">Criar uma nova conta</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.login-form__links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-form__link {
  font-size: 0.875rem;
  color: var(--color-link);
  text-decoration: none;
}

.login-form__register {
  font-size: 0.875rem;
  color: var(--color-text);
  display: flex;
  gap: 0.375rem;
  align-items: center;
}
</style>
```

#### `src/components/Toast.vue`
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  type: 'success' | 'error'
  message: string
}>()

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 7000)
})
</script>

<template>
  <div v-if="visible" :class="['toast', { toast__error: type === 'error' }]">
    {{ message }}
    <button class="toast__close" @click="visible = false">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  background-color: #dcfce7;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.toast__close {
  background-color: transparent;
  border: none;
  color: var(--color-success);
  cursor: pointer;
}

.toast__error {
  background-color: #fee2e2;
  color: var(--color-error);
}
</style>
```

#### `src/components/Loading.vue`
```vue
<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Carregando...',
})
</script>

<template>
  <div class="loading">
    <span class="spinner"></span>
    <span class="loading-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-text {
  font-family: var(--font-family);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

#### `src/components/EmptyList.vue`
```vue
<script setup lang="ts">
defineProps({
  text: String,
})
</script>

<template>
  <p class="empty__notice">{{ text }}</p>
</template>

<style scoped>
.empty__notice {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
```

#### `src/components/ItemList.vue`
```vue
<script setup lang="ts" generic="T extends { id: string }">
withDefaults(
  defineProps<{
    items: T[]
    removingId?: string | null
    showRemoveButton?: boolean
  }>(),
  {
    removingId: null,
    showRemoveButton: true,
  },
)

defineEmits<{
  remove: [item: T]
}>()
</script>

<template>
  <ul class="list">
    <li v-for="item in items" :key="item.id" class="list__item">
      <div class="list__content">
        <slot :item="item" />
      </div>
      <button
        v-if="showRemoveButton"
        class="list__remove-btn"
        :disabled="removingId === item.id"
        @click="$emit('remove', item)"
      >
        {{ removingId === item.id ? 'Removendo...' : 'Remover' }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  gap: 1rem;
}

.list__remove-btn {
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
}

.list__remove-btn:disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-button-text-disabled);
  cursor: not-allowed;
}
</style>
```

#### `src/components/NavigationList.vue`
```vue
<script setup lang="ts">
defineProps<{
  links: { link: string; text: string }[]
}>()
</script>

<template>
  <nav class="management__nav">
    <ul class="management__nav-list">
      <li v-for="link in links" :key="link.link">
        <RouterLink :to="link.link" class="management__link">{{ link.text }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
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
}

.management__link:hover {
  border-color: var(--color-border-focus);
  background-color: var(--color-input-bg);
}
</style>
```

#### `src/components/ManagementHeader.vue`
```vue
<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'

withDefaults(
  defineProps<{
    title: string
    buttonText?: {
      add: string
      cancel: string
    }
    showButton?: boolean
    showForm?: boolean
  }>(),
  {
    title: '',
    buttonText: () => ({ add: 'Adicionar', cancel: 'Cancelar' }),
    showButton: true,
    showForm: false,
  },
)

const emit = defineEmits<{ 'click:button': [] }>()
</script>

<template>
  <header class="management__header">
    <h2 class="page__title">{{ title }}</h2>
    <AppButton v-if="showButton" type="button" @click="emit('click:button')">
      {{ showForm ? buttonText.cancel : buttonText.add }}
    </AppButton>
  </header>
</template>

<style scoped>
.management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.management__header :deep(.app-button) {
  width: auto;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}
</style>
```

#### `src/components/AppointmentList.vue`
```vue
<script setup lang="ts">
import { reverseDate } from '@/utils'

export interface AppointmentListProps {
  appointmentsData: {
    id: string
    dateAppointment: {
      date: string
      time: string
    }
    speciality: string
    doctor: { id: string; name: string }
    status?: string
    weather?: {
      condition: {
        text: string
        icon: string
      }
      max: number
      min: number
    }
  }[]
}

defineProps<AppointmentListProps>()
</script>

<template>
  <ul class="appointment-card-list" v-if="appointmentsData.length > 0">
    <li v-for="appointment in appointmentsData" :key="appointment.id">
      <div class="appointment-card">
        <header class="appointment-card__header">
          <time class="appointment-card__datetime"
            >{{ reverseDate(appointment.dateAppointment.date) }} -
            {{ appointment.dateAppointment.time }}</time
          >
        </header>

        <div class="appointment-card__body">
          <div class="appointment-card__main">
            <p class="appointment-card__specialty">{{ appointment.speciality }}</p>
            <p class="appointment-card__doctor">{{ appointment.doctor.name }}</p>
          </div>

          <div v-if="appointment.weather?.condition" class="appointment-card__weather">
            <div class="appointment-card__weather-icon" aria-hidden="true">
              <img
                :src="appointment.weather.condition.icon"
                alt="{{ appointment.weather.condition.text }}"
              />
            </div>
            <div class="appointment-card__weather-info">
              <p class="appointment-card__weather-desc">{{ appointment.weather.condition.text }}</p>
              <p
                v-if="appointment.weather.max !== undefined && appointment.weather.min !== undefined"
                class="appointment-card__weather-temp"
              >
                <span>MAX: {{ appointment.weather.max }}</span>
                <span>MIN: {{ appointment.weather.min }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.appointment-card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.appointment-card {
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.appointment-card__datetime {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.appointment-card__specialty {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text);
}

.appointment-card__doctor {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
}

.appointment-card__weather {
  display: flex;
  gap: 0.375rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.appointment-card__weather-icon > img {
  width: 50px;
  object-fit: cover;
}

.appointment-card__weather-desc {
  font-size: 0.788rem;
  text-align: right;
}

.appointment-card__weather-temp {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
  font-size: 0.788rem;
  font-weight: 600;
  margin-top: 0.125rem;
}
</style>
```

#### `src/components/AppointmentForm.vue`
```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores'
import Toast from '@/components/Toast.vue'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'
import { reverseDate } from '@/utils'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()
const userStore = useUserStore()
const specialities = ref([])
const professionals = ref([])
const selectedSpeciality = ref()
const selectedSchedule = ref()
const selectedProfessional = ref()
const submitted = ref(false)

const schedules = ref<{ id: string; availableDate: Record<string, string>[] }>({
  id: '',
  availableDate: [],
})

const hasError = ref({
  speciality: false,
  professional: false,
  schedule: false,
  submitted: false,
})

const toastKeys = ref({
  speciality: 0,
  submitted: 0,
  success: 0,
})

async function loadSpecialities() {
  hasError.value.speciality = false
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
      },
    })
    if (!response.ok) {
      if (response.status === 401) {
        userStore.logout()
        return
      }
      throw new Error('Error ao carregar especialidades')
    }
    const data = await response.json()
    if (!data.length) {
      return []
    }
    return data
  } catch (error) {
    console.error(error)
    hasError.value.speciality = true
    toastKeys.value.speciality++
    throw error
  }
}

async function loadSchedules(specialityId: string) {
  hasError.value.schedule = false
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}&fields=id,availableDate`,
      {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Error ao carregar datas disponíveis')
    }
    const data = await response.json()
    if (!data.length) {
      return { id: '', availableDate: [] }
    }
    const availableData = data.flatMap((item: { availableDate: Record<string, string>[] }) =>
      item.availableDate.map((available: Record<string, string>) => ({
        id: available.id,
        name: `${reverseDate(available.date)} às ${available.time}`,
      })),
    )
    return { id: data[0].id, availableDate: availableData }
  } catch (error) {
    console.error(error)
    hasError.value.schedule = true
    throw error
  }
}

watch(selectedSpeciality, async (newValue) => {
  schedules.value = { id: '', availableDate: [] }
  selectedSchedule.value = undefined
  professionals.value = []
  selectedProfessional.value = undefined
  hasError.value.submitted = false

  if (newValue) {
    const schedulesData = await loadSchedules(newValue)
    schedules.value.id = schedulesData.id
    schedules.value.availableDate = schedulesData.availableDate
  }
})

async function loadProfessionals(specialityId: string) {
  hasError.value.professional = false
  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}&fields=doctor`,
      {
        headers: {
          Authorization: `Bearer ${userStore.accessToken}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Error ao carregar especialidades')
    }
    const data = await response.json()
    return data.map((item: { doctor: Record<string, string> }) => ({
      id: item.doctor.id,
      name: item.doctor.name,
    }))
  } catch (error) {
    console.error(error)
    hasError.value.professional = true
    throw error
  }
}

watch(selectedSchedule, async (newValue) => {
  professionals.value = []
  selectedProfessional.value = undefined
  hasError.value.submitted = false

  if (newValue) {
    professionals.value = await loadProfessionals(selectedSpeciality.value!)
  }
})

function resetForm() {
  selectedSpeciality.value = undefined
  selectedSchedule.value = undefined
  selectedProfessional.value = undefined
  professionals.value = []
  schedules.value = { id: '', availableDate: [] }
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  try {
    const payload = {
      slotId: schedules.value.id,
      userId: userStore.userData?.id,
      availableDateId: selectedSchedule.value,
    }
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      hasError.value.submitted = true
      toastKeys.value.submitted++
      throw new Error('Erro ao marcar consulta')
    }
    resetForm()
    submitted.value = true
    toastKeys.value.success++
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value.submitted = true
    toastKeys.value.submitted++
  }
}

onMounted(async () => {
  try {
    specialities.value = await loadSpecialities()
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <Toast
    v-if="hasError.speciality"
    :key="toastKeys.speciality"
    type="error"
    message="Ocorreu um erro ao carregar as especialidades."
  />
  <Toast
    v-if="hasError.submitted"
    :key="toastKeys.submitted"
    type="error"
    message="Ocorreu um erro ao marcar a consulta."
  />
  <Toast
    v-if="submitted"
    :key="toastKeys.success"
    type="success"
    message="Consulta marcada com sucesso!"
  />

  <section class="forms-container">
    <form class="forms__form" @submit="handleSubmit" novalidate>
      <AppSelect
        id="specialty"
        label="Especialidade:"
        :placeholder="
          specialities.length === 0
            ? 'Nenhuma especialidade cadastrada'
            : 'Selecione uma especialidade'
        "
        :options="specialities"
        v-model="selectedSpeciality"
      />
      <AppSelect
        id="schedule"
        label="Horários disponíveis:"
        :placeholder="
          !selectedSpeciality
            ? 'Selecione uma especialidade'
            : schedules.availableDate.length === 0
              ? 'Não existem horários disponíveis'
              : 'Selecione um horário'
        "
        :options="schedules.availableDate"
        v-model="selectedSchedule"
        :disabled="!selectedSpeciality"
      />
      <AppSelect
        id="professional"
        label="Profissionais de saúde:"
        :placeholder="
          !selectedSchedule
            ? 'Selecione um horário'
            : professionals.length === 0
              ? 'Nenhum médico cadastrado'
              : 'Selecione o profissional'
        "
        :options="professionals"
        v-model="selectedProfessional"
        :disabled="!selectedSchedule"
      />
      <AppInput id="slotId" type="hidden" v-model="schedules.id" />
      <AppButton type="submit" :disabled="!selectedProfessional">Agendar</AppButton>
    </form>
  </section>
</template>
```

#### `src/components/SlotForm.vue`
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

interface Props {
  onSuccess?: () => void
}

type Speciality = { id: string; name: string }
type DateEntry = { date: string; time: string }

const props = defineProps<Props>()
const userStore = useUserStore()
const specialities = ref<Speciality[]>([])
const selectedSpecialityId = ref('')
const doctorName = ref('')
const dateEntries = ref<DateEntry[]>([{ date: '', time: '' }])
const isSubmitting = ref(false)
const hasError = ref(false)

function addDateEntry() {
  dateEntries.value.push({ date: '', time: '' })
}

function removeDateEntry(index: number) {
  dateEntries.value.splice(index, 1)
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({
        specialityId: selectedSpecialityId.value,
        doctorName: doctorName.value,
        availableDate: dateEntries.value,
      }),
    })
    if (!response.ok) {
      throw new Error('Erro ao cadastrar slot')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}

const isFormValid = () =>
  selectedSpecialityId.value &&
  doctorName.value.trim() &&
  dateEntries.value.every((e) => e.date && e.time)

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` },
    })
    if (!response.ok) throw new Error('Erro ao carregar especialidades')
    specialities.value = await response.json()
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível cadastrar o slot." />
  <form class="forms__form" @submit="handleSubmit" novalidate>
    <AppSelect
      id="slot-speciality"
      label="Especialidade:"
      placeholder="Selecione uma especialidade"
      :options="specialities"
      v-model="selectedSpecialityId"
    />
    <AppInput
      id="slot-doctor"
      label="Nome do médico:"
      type="text"
      placeholder="ex.: Dr. João Silva"
      v-model="doctorName"
    />

    <div class="slot-form__dates">
      <p class="slot-form__dates-label">Horários disponíveis:</p>
      <div v-for="(entry, index) in dateEntries" :key="index" class="slot-form__date-row">
        <AppInput :id="`slot-date-${index}`" label="Data:" type="date" v-model="entry.date" />
        <AppInput :id="`slot-time-${index}`" label="Horário:" type="time" v-model="entry.time" />
        <button
          v-if="dateEntries.length > 1"
          type="button"
          class="slot-form__remove-date"
          @click="removeDateEntry(index)"
          aria-label="Remover horário"
        >
          &times;
        </button>
      </div>
      <button type="button" class="slot-form__add-date" @click="addDateEntry">
        + Adicionar horário
      </button>
    </div>

    <AppButton type="submit" :disabled="isSubmitting || !isFormValid()">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>

<style scoped>
.slot-form__dates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slot-form__date-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.slot-form__remove-date {
  height: 2.5rem;
  width: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background-color: var(--color-input-bg);
  color: var(--color-error);
  font-size: 1.25rem;
  cursor: pointer;
}

.slot-form__add-date {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-link);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}
</style>
```

#### `src/components/SpecialityForm.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()
const userStore = useUserStore()
const name = ref('')
const isSubmitting = ref(false)
const hasError = ref(false)

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({ name: name.value }),
    })
    if (!response.ok) {
      throw new Error('Erro ao cadastrar especialidade')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível cadastrar a especialidade." />
  <form class="speciality-form" @submit="handleSubmit" novalidate>
    <AppInput
      id="speciality-name"
      label="Nome da especialidade:"
      type="text"
      placeholder="ex.: Cardiologia"
      v-model="name"
    />
    <AppButton type="submit" :disabled="isSubmitting || !name.trim()">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>

<style scoped>
.speciality-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
```

#### `src/components/AppointmentAdminForm.vue`
```vue
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores'
import AppSelect from '@/components/AppSelect.vue'
import AppButton from '@/components/AppButton.vue'
import Toast from '@/components/Toast.vue'
import { reverseDate } from '@/utils'

interface Props {
  onSuccess?: () => void
}

type User = { id: string; name: string; type: string }
type Speciality = { id: string; name: string }
type AvailableDate = { id: string; date: string; time: string; isBooked: boolean }
type Slot = { id: string; doctor: { id: string; name: string }; availableDate: AvailableDate[] }

const props = defineProps<Props>()
const userStore = useUserStore()
const users = ref<User[]>([])
const specialities = ref<Speciality[]>([])
const slots = ref<Slot[]>([])
const selectedUserId = ref('')
const selectedSpecialityId = ref('')
const selectedSlotId = ref('')
const selectedDateId = ref('')
const isSubmitting = ref(false)
const hasError = ref(false)

const userOptions = computed(() =>
  users.value.filter((u) => u.type === 'user').map((u) => ({ id: u.id, name: u.name })),
)

const slotOptions = computed(() => slots.value.map((s) => ({ id: s.id, name: s.doctor.name })))

const selectedSlot = computed(() => slots.value.find((s) => s.id === selectedSlotId.value))

const dateOptions = computed(() =>
  (selectedSlot.value?.availableDate ?? [])
    .filter((d) => !d.isBooked)
    .map((d) => ({ id: d.id, name: `${reverseDate(d.date)} às ${d.time}` })),
)

const isFormValid = computed(
  () =>
    !!selectedUserId.value &&
    !!selectedSpecialityId.value &&
    !!selectedSlotId.value &&
    !!selectedDateId.value,
)

watch(selectedSpecialityId, async (specialityId) => {
  slots.value = []
  selectedSlotId.value = ''
  selectedDateId.value = ''

  if (!specialityId) return

  try {
    const response = await fetch(
      `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/slots?specialityId=${specialityId}`,
      { headers: { Authorization: `Bearer ${userStore.accessToken}` } },
    )
    if (!response.ok) throw new Error('Erro ao carregar médicos')
    slots.value = await response.json()
  } catch (error) {
    console.error(error)
    hasError.value = true
  }
})

watch(selectedSlotId, () => {
  selectedDateId.value = ''
})

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault()
  hasError.value = false
  isSubmitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.accessToken}`,
      },
      body: JSON.stringify({
        slotId: selectedSlotId.value,
        availableDateId: selectedDateId.value,
        userId: selectedUserId.value,
      }),
    })
    if (!response.ok) {
      throw new Error('Erro ao criar consulta')
    }
    props.onSuccess?.()
  } catch (error) {
    console.error(error)
    hasError.value = true
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const [usersRes, specialitiesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/users`, {
        headers: { Authorization: `Bearer ${userStore.accessToken}` },
      }),
      fetch(`${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/specialities`, {
        headers: { Authorization: `Bearer ${userStore.accessToken}` },
      }),
    ])
    if (!usersRes.ok) throw new Error('Erro ao carregar usuários')
    if (!specialitiesRes.ok) throw new Error('Erro ao carregar especialidades')
    users.value = await usersRes.json()
    specialities.value = await specialitiesRes.json()
  } catch (error) {
    console.error(error)
    hasError.value = true
  }
})
</script>

<template>
  <Toast v-if="hasError" type="error" message="Não foi possível criar a consulta." />

  <form class="forms__form" @submit="handleSubmit" novalidate>
    <AppSelect
      id="appointment-user"
      label="Paciente:"
      placeholder="Selecione um paciente"
      :options="userOptions"
      v-model="selectedUserId"
    />
    <AppSelect
      id="appointment-speciality"
      label="Especialidade:"
      :placeholder="
        specialities.length === 0
          ? 'Nenhuma especialidade cadastrada'
          : 'Selecione uma especialidade'
      "
      :options="specialities"
      v-model="selectedSpecialityId"
    />
    <AppSelect
      id="appointment-slot"
      label="Médico:"
      :placeholder="
        !selectedSpecialityId
          ? 'Selecione uma especialidade'
          : slotOptions.length === 0
            ? 'Nenhum médico cadastrado'
            : 'Selecione um médico'
      "
      :options="slotOptions"
      :disabled="!selectedSpecialityId"
      v-model="selectedSlotId"
    />
    <AppSelect
      id="appointment-date"
      label="Data e horário:"
      :placeholder="
        !selectedSlotId
          ? 'Selecione um médico'
          : dateOptions.length === 0
            ? 'Nenhum horário disponível'
            : 'Selecione um horário'
      "
      :options="dateOptions"
      :disabled="!selectedSlotId"
      v-model="selectedDateId"
    />
    <AppButton type="submit" :disabled="isSubmitting || !isFormValid">
      {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
    </AppButton>
  </form>
</template>
```

---

## 16. REFERÊNCIAS

VUE.JS. **Vue 3 documentation**. Disponível em: https://vuejs.org/guide/introduction. Acesso em: mar. 2026.

PINIA. **Pinia documentation**. Disponível em: https://pinia.vuejs.org/introduction. Acesso em: mar. 2026.

VUE ROUTER. **Vue Router documentation**. Disponível em: https://router.vuejs.org. Acesso em: mar. 2026.

VITE. **Vite documentation**. Disponível em: https://vitejs.dev/guide. Acesso em: mar. 2026.

VITEST. **Vitest documentation**. Disponível em: https://vitest.dev/guide. Acesso em: mar. 2026.

VUE TEST UTILS. **Vue Test Utils documentation**. Disponível em: https://test-utils.vuejs.org. Acesso em: mar. 2026.

VIACEP. **API de consulta de CEP**. Disponível em: https://viacep.com.br. Acesso em: mar. 2026.

WEATHER API. **WeatherAPI documentation**. Disponível em: https://www.weatherapi.com/docs. Acesso em: mar. 2026.

OSMANI, Addy. **Learning JavaScript design patterns**. 2. ed. Sebastopol: O'Reilly Media, 2023.

---

*Documento gerado em março de 2026.*
