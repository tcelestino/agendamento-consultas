# SISTEMA DE AGENDAMENTO DE CONSULTAS MÉDICAS
## Documentação Técnica — API REST

---

**Instituição:** Faculdade UNIJORGE
**Disciplina:** Desenvolvimento Backend I
**Projeto:** Sistema de Atendimento Inteligente para Clínicas Médicas
**Módulo:** Backend — API REST
**Data:** Março de 2026

---

## SUMÁRIO

1. [Introdução](#1-introdução)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Modelos de Dados](#5-modelos-de-dados)
6. [Camada de Repositórios](#6-camada-de-repositórios)
7. [Camada de Serviços](#7-camada-de-serviços)
8. [Camada de Controladores](#8-camada-de-controladores)
9. [Rotas da API](#9-rotas-da-api)
10. [Autenticação e Autorização](#10-autenticação-e-autorização)
11. [Middlewares](#11-middlewares)
12. [Integrações Externas](#12-integrações-externas)
13. [Configuração de Ambiente](#13-configuração-de-ambiente)
14. [Testes](#14-testes)
15. [Execução e Deploy](#15-execução-e-deploy)
16. [Referências](#16-referências)

---

## 1. INTRODUÇÃO

Este documento descreve a arquitetura, implementação e funcionamento da API REST desenvolvida para o sistema de agendamento de consultas médicas. A aplicação tem como objetivo informatizar o processo de agendamento de uma clínica médica de pequeno porte, oferecendo recursos de autenticação segura, controle de acesso por perfil de usuário e integração com serviços externos.

### 1.1 Objetivo

Prover uma interface programática (API) que permita ao frontend realizar operações de:

- Cadastro e autenticação de usuários (pacientes e funcionários);
- Gerenciamento de especialidades médicas;
- Criação e controle de horários disponíveis (slots);
- Agendamento e cancelamento de consultas;
- Consulta de endereço por CEP;
- Previsão meteorológica para a data da consulta.

### 1.2 Escopo

A API cobre os módulos: autenticação, usuários, especialidades, horários (slots), agendamentos e informações externas (endereço e clima). Não contempla módulos de pagamento, notificação por e-mail ou prontuário eletrônico.

---

## 2. TECNOLOGIAS UTILIZADAS

| Categoria | Tecnologia | Versão |
|---|---|---|
| Ambiente de execução | Node.js | ≥ 20.19.0 ou ≥ 22.12.0 |
| Linguagem | TypeScript | 5.9.3 |
| Framework HTTP | Express | 5.2.1 |
| Banco de dados | MongoDB (via Docker) | — |
| ODM | Mongoose | 9.2.3 |
| Autenticação | JSON Web Token (jsonwebtoken) | 9.0.3 |
| Hash de senha | bcrypt | 6.0.0 |
| Cliente HTTP | Axios | 1.13.6 |
| Log | Pino / pino-http | 10.x / 11.0.0 |
| Geração de ID | uuid | 13.0.0 |
| CORS | cors | 2.8.6 |
| Testes | Vitest | 4.0.18 |
| Testes HTTP | Supertest | 7.2.2 |
| Build/Dev | tsx | — |
| Linting | ESLint + @typescript-eslint | — |

---

## 3. ARQUITETURA DO SISTEMA

A API segue o padrão de arquitetura em camadas, com separação explícita de responsabilidades. O fluxo de uma requisição percorre as seguintes camadas:

```
Requisição HTTP
      ↓
   Routes           (definição de endpoints e middlewares)
      ↓
   Middlewares       (autenticação, autorização, log)
      ↓
   Controllers       (validação de entrada, orquestração)
      ↓
   Services          (regras de negócio)
      ↓
   Repositories      (interfaces — contratos de acesso a dados)
      ↓
   Infra/Repositories (implementações MongoDB ou APIs externas)
      ↓
   Banco de Dados / APIs Externas
```

### 3.1 Princípios Aplicados

- **Separação de Responsabilidades (SRP):** cada camada tem uma responsabilidade única e bem definida.
- **Inversão de Dependência (DIP):** serviços dependem de interfaces (repositórios), não de implementações concretas.
- **Injeção de Dependência:** repositórios e instâncias Axios são injetados via construtor, facilitando os testes.
- **Interface Segregation:** cada domínio possui sua própria interface de repositório.

### 3.2 Módulo de Sistema (ESM)

O projeto utiliza ES Modules (`"type": "module"` no `package.json`), com `tsx` para execução direta de TypeScript em desenvolvimento e produção.

---

## 4. ESTRUTURA DE DIRETÓRIOS

```
api/
├── src/
│   ├── server.ts                    # Entry point: conecta MongoDB e inicia Express
│   ├── app.ts                       # Configura middlewares e monta rotas
│   ├── controllers/                 # Camada de controle (HTTP request/response)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── appointments.controller.ts
│   │   ├── slots.controller.ts
│   │   ├── specialties.controller.ts
│   │   ├── infos.controller.ts
│   │   └── index.ts
│   ├── services/                    # Camada de negócio
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── appointment.service.ts
│   │   ├── slot.service.ts
│   │   ├── speciality.service.ts
│   │   ├── address.service.ts
│   │   ├── weather.service.ts
│   │   └── index.ts
│   ├── repositories/                # Interfaces (contratos)
│   │   ├── user.repository.interface.ts
│   │   ├── appointment.repository.interface.ts
│   │   ├── slot.repository.interface.ts
│   │   ├── speciality.repository.interface.ts
│   │   ├── address.repository.interface.ts
│   │   ├── weather.repository.interface.ts
│   │   └── index.ts
│   ├── infra/
│   │   ├── repositories/            # Implementações concretas
│   │   │   ├── user.repository.ts
│   │   │   ├── appointment.repository.ts
│   │   │   ├── slot.repository.ts
│   │   │   ├── speciality.repository.ts
│   │   │   ├── address.repository.ts
│   │   │   ├── weather.repository.ts
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   └── database.ts          # Conexão Mongoose
│   │   └── logs/
│   │       └── index.ts             # Instância do logger Pino
│   ├── models/                      # Schemas Mongoose
│   │   ├── appointment.ts
│   │   ├── slot.ts
│   │   ├── speciality.ts
│   │   └── index.ts
│   ├── routes/                      # Definição de endpoints
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── appointments.ts
│   │   ├── slots.ts
│   │   ├── specialities.ts
│   │   ├── infos.ts
│   │   └── index.ts
│   ├── middlewares/                 # Middlewares Express
│   │   ├── auth.middleware.ts
│   │   ├── access.middleware.ts
│   │   ├── logs.middleware.ts
│   │   └── index.ts
│   └── types/
│       └── express.d.ts             # Augmentation do tipo Request
├── __tests__/
│   ├── setup.ts                     # Variáveis de ambiente para testes
│   ├── unit/                        # Testes unitários
│   └── e2e/                         # Testes end-to-end
├── docker-compose.dependencies.yaml # Sobe apenas o MongoDB
├── package.json
├── tsconfig.json
└── .env                             # Variáveis de ambiente (não versionado)
```

---

## 5. MODELOS DE DADOS

Os dados são persistidos no MongoDB. O modelo `User` tem seu schema definido diretamente no arquivo do repositório (`user.repository.ts`); os demais estão em `src/models/`.

### 5.1 User

Representa pacientes e funcionários do sistema.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | String (UUID) | único, indexado | Identificador único |
| `email` | String | único, indexado, obrigatório | E-mail do usuário |
| `name` | String | obrigatório | Nome completo |
| `pass` | String | obrigatório | Senha com hash bcrypt |
| `type` | `'user' \| 'employee'` | obrigatório | Perfil de acesso |
| `status` | `'active' \| 'inactive'` | padrão: `'active'` | Status da conta |
| `address.zipCode` | String | opcional | CEP |
| `address.street` | String | opcional | Logradouro |
| `address.neighborhood` | String | opcional | Bairro |
| `address.city` | String | opcional | Cidade |
| `address.state.name` | String | opcional | Nome do estado |
| `address.state.code` | String | opcional | Sigla do estado |
| `createdAt` | Date | automático | Data de criação |
| `updatedAt` | Date | automático | Data de atualização |

### 5.2 Speciality (Especialidade Médica)

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | String (UUID) | único, indexado | Identificador único |
| `name` | String | obrigatório | Nome da especialidade |
| `createdAt` | Date | automático | Data de criação |

### 5.3 Slot (Horário Disponível)

Representa os horários de atendimento de um médico em uma especialidade.

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | String (UUID) | único, indexado | Identificador único |
| `specialityId` | String | indexado, obrigatório | ID da especialidade |
| `doctor.id` | String (UUID) | único, indexado | ID do médico |
| `doctor.name` | String | obrigatório | Nome do médico |
| `availableDate[].id` | String (UUID) | único, indexado | ID do horário |
| `availableDate[].date` | String | obrigatório | Data no formato `YYYY-MM-DD` |
| `availableDate[].time` | String | obrigatório | Hora no formato `HH:mm` |
| `availableDate[].isBooked` | Boolean | padrão: `false` | Indica se está reservado |
| `availableDate[].appointmentId` | String | padrão: `null` | ID do agendamento associado |
| `createdAt` | Date | automático | Data de criação |

### 5.4 Appointment (Agendamento)

| Campo | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | String (UUID) | único, indexado | Identificador único |
| `status` | String | obrigatório | Status: `'active'`, etc. |
| `userId` | String | indexado, obrigatório | ID do paciente |
| `slotId` | String | indexado, obrigatório | ID do slot |
| `dateAppointment.id` | String | obrigatório | ID do horário no slot |
| `dateAppointment.date` | String | obrigatório | Data da consulta (`YYYY-MM-DD`) |
| `dateAppointment.time` | String | obrigatório | Hora da consulta (`HH:mm`) |
| `doctor.id` | String | obrigatório | ID do médico |
| `doctor.name` | String | obrigatório | Nome do médico |
| `speciality.id` | String | obrigatório | ID da especialidade |
| `speciality.name` | String | obrigatório | Nome da especialidade |
| `createdAt` | Date | automático | Data de criação |
| `updatedAt` | Date | automático | Data de atualização |

---

## 6. CAMADA DE REPOSITÓRIOS

Os repositórios seguem o padrão Repository Pattern com separação entre interface e implementação. Isso permite substituir a implementação (por exemplo, trocar MongoDB por outro banco) sem alterar as camadas superiores.

### 6.1 Interfaces (Contratos)

As interfaces TypeScript localizam-se em `src/repositories/` e definem os métodos que cada repositório deve implementar.

**IUserRepository:**
```typescript
interface IUserRepository {
  create(data: IUser): Promise<void>
  findAll(): Promise<IUserPublic[]>
  findById(id: string, fields?: string): Promise<IUserPublic | null>
  findByEmail(email: string): Promise<IUserPrivate | null>
  update(id: string, data: Partial<IUser>): Promise<void>
  delete(id: string): Promise<void>
}
```

**IAppointmentRepository:**
```typescript
interface IAppointmentRepository {
  create(data: IAppointment): Promise<void>
  listAll(): Promise<IAppointmentListResponse[]>
  listByUserId(userId: string): Promise<IAppointmentData[]>
  delete(id: string): Promise<void>
}
```

**ISlotRepository:**
```typescript
interface ISlotRepository {
  create(data: ISlotData): Promise<void>
  listAll(fields?: string): Promise<ISlotData[]>
  listAvailable(specialityId: string, fields?: string): Promise<ISlotData[]>
  findById(id: string, fields?: string): Promise<ISlotData | null>
  bookSlot(slotId: string, availableDateId: string, appointmentId: string): Promise<ISlotBooked>
  releaseSlot(appointmentId: string, availableDateId: string): Promise<void>
}
```

**ISpecialityRepository:**
```typescript
interface ISpecialityRepository {
  create(name: string): Promise<void>
  listAll(): Promise<ISpecialityData[]>
  findById(id: string): Promise<ISpecialityData | null>
  delete(id: string): Promise<void>
}
```

**IAddressRepository:**
```typescript
interface IAddressRepository {
  getByZipCode(zipCode: string): Promise<IAddressResponse>
}
```

**IWeatherRepository:**
```typescript
interface IWeatherRepository {
  getByCity(city: string, date?: string): Promise<IWeatherResponse | null>
}
```

### 6.2 Implementações (Infra)

As implementações concretas ficam em `src/infra/repositories/`. As que acessam APIs externas (ViaCEP, WeatherAPI) recebem uma instância de `AxiosInstance` via construtor, permitindo mock nos testes unitários. Os serviços criam as instâncias via `axios.create()` e as injetam.

---

## 7. CAMADA DE SERVIÇOS

Os serviços contêm as regras de negócio e são responsáveis por validar dados, orquestrar chamadas a repositórios e lançar erros com mensagens descritivas.

### 7.1 AuthService

Responsável pelo processo de autenticação.

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `login` | `email: string, pass: string` | `{ accessToken: string }` | Valida credenciais e gera token JWT |
| `generateAccessToken` | `userId: string, userType: string` | `string` | Gera JWT com expiração de 15 minutos |
| `verifyAccessToken` | `token: string` | `JwtPayload` | Verifica assinatura e validade do token |
| `comparePassword` | `pass: string, hash: string` | `Promise<boolean>` | Compara senha com hash bcrypt |

### 7.2 UserService

Gerencia operações de usuários.

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `create` | `data: IUser` | `Promise<void>` | Valida dados, faz hash da senha e persiste |
| `findAll` | — | `Promise<IUserPublic[]>` | Retorna todos os usuários sem campo `pass` |
| `findById` | `id: string, fields?: string` | `Promise<IUserPublic \| null>` | Busca usuário por ID com campos seletivos |
| `findByEmail` | `email: string` | `Promise<IUserPrivate \| null>` | Busca por e-mail (inclui hash para autenticação) |
| `update` | `id: string, data: Partial<IUser>` | `Promise<void>` | Atualiza dados do usuário |
| `delete` | `id: string` | `Promise<void>` | Remove o usuário |

**Validações internas:** `validateData()`, `validateEmail()`, `validateStatus()`, `hashPassword()`.

### 7.3 AppointmentService

Gerencia agendamentos.

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `create` | `data: ICreateAppointmentData` | `Promise<void>` | Reserva o slot e cria o agendamento |
| `listAll` | — | `Promise<IAppointmentListResponse[]>` | Lista todos os agendamentos (admin) |
| `listByUserId` | `userId: string` | `Promise<Record<string, unknown>[]>` | Lista agendamentos de um usuário |
| `delete` | `appointmentId: string, availableDateId: string` | `Promise<void>` | Cancela agendamento e libera o slot |

### 7.4 SlotService

Gerencia horários disponíveis.

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `create` | `data: ISlotInput` | `Promise<void>` | Cria um novo conjunto de horários |
| `listAll` | `fields?: string` | `Promise<ISlotData[]>` | Lista todos os slots |
| `listAvailable` | `specialityId: string, fields?: string` | `Promise<ISlotData[]>` | Filtra horários disponíveis por especialidade |
| `findById` | `id: string, fields?: string` | `Promise<ISlotData \| null>` | Busca slot por ID |
| `bookSlot` | `slotId: string, availableDateId: string, appointmentId: string` | `Promise<ISlotBooked>` | Marca horário como reservado |
| `releaseSlot` | `appointmentId: string, availableDateId: string` | `Promise<void>` | Libera horário ao cancelar consulta |

### 7.5 SpecialityService

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `create` | `name: string` | `Promise<void>` | Cria especialidade |
| `listAll` | — | `Promise<ISpecialityData[]>` | Lista todas as especialidades |
| `findById` | `id: string` | `Promise<ISpecialityData \| null>` | Busca por ID |
| `delete` | `id: string` | `Promise<void>` | Remove especialidade |

### 7.6 AddressService

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `getAddressByZipCode` | `zipCode: string` | `Promise<IAddressResponse>` | Consulta endereço via ViaCEP |

### 7.7 WeatherService

| Método | Parâmetros | Retorno | Descrição |
|---|---|---|---|
| `getWeatherByCity` | `city: string, date?: string` | `Promise<IWeatherResponse \| null>` | Consulta previsão do tempo via WeatherAPI |

---

## 8. CAMADA DE CONTROLADORES

Os controladores recebem a requisição HTTP, validam os parâmetros de entrada (body, query, params), chamam os serviços correspondentes e constroem a resposta HTTP.

### 8.1 AuthController

| Método | Rota | Ação |
|---|---|---|
| `login` | `POST /auth/login` | Autentica o usuário e retorna o access token |
| `logout` | `POST /auth/logout` | Encerra a sessão (responde 204) |

### 8.2 UserController

| Método | Rota | Ação |
|---|---|---|
| `create` | `POST /users` | Registra novo usuário |
| `listAll` | `GET /users` | Lista todos os usuários (EMPLOYEE) |
| `getMe` | `GET /users/me` | Retorna dados do usuário autenticado |
| `getById` | `GET /users/:id` | Retorna usuário por ID |
| `update` | `PATCH /users/:id` | Atualiza dados do usuário |
| `delete` | `DELETE /users/:id` | Remove usuário (EMPLOYEE) |

### 8.3 AppointmentsController

| Método | Rota | Ação |
|---|---|---|
| `create` | `POST /appointments` | Cria agendamento |
| `listAll` | `GET /appointments` | Lista todos (EMPLOYEE) |
| `listByUser` | `GET /appointments/:userId` | Lista agendamentos do usuário |
| `delete` | `DELETE /appointments/:id` | Cancela agendamento (EMPLOYEE) |

### 8.4 SlotsController

| Método | Rota | Ação |
|---|---|---|
| `create` | `POST /slots` | Cria horários (EMPLOYEE) |
| `listAll` | `GET /slots` | Lista slots (com filtro por especialidade) |
| `getById` | `GET /slots/:id` | Busca slot por ID (EMPLOYEE) |

### 8.5 SpecialitiesController

| Método | Rota | Ação |
|---|---|---|
| `create` | `POST /specialities` | Cria especialidade (EMPLOYEE) |
| `listAll` | `GET /specialities` | Lista especialidades |
| `delete` | `DELETE /specialities/:id` | Remove especialidade (EMPLOYEE) |

### 8.6 InfosController

| Método | Rota | Ação |
|---|---|---|
| `getAddress` | `GET /infos/address/:zipCode` | Retorna endereço pelo CEP |
| `getWeather` | `GET /infos/weather/:city` | Retorna previsão do tempo |

---

## 9. ROTAS DA API

### 9.1 Configuração Base

- **Base URL:** `http://localhost:{PORT}/api/v1`
- **Formato das respostas:** JSON
- **Autenticação:** `Authorization: Bearer <accessToken>` (JWT)

### 9.2 Health Check

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | Não | Verifica se a API está operacional |

### 9.3 Autenticação

| Método | Endpoint | Auth | Body | Resposta |
|---|---|---|---|---|
| `POST` | `/auth/login` | Não | `{ email, pass }` | `200 { accessToken }` |
| `POST` | `/auth/logout` | Sim | — | `204 No Content` |

### 9.4 Usuários

| Método | Endpoint | Auth | Perfil | Descrição |
|---|---|---|---|---|
| `POST` | `/users` | Não | — | Registra novo usuário |
| `GET` | `/users` | Sim | EMPLOYEE | Lista todos os usuários |
| `GET` | `/users/me` | Sim | Qualquer | Dados do usuário autenticado (query: `?fields=...`) |
| `GET` | `/users/:id` | Sim | Qualquer | Busca usuário por ID |
| `PATCH` | `/users/:id` | Sim | Qualquer | Atualiza dados |
| `DELETE` | `/users/:id` | Sim | EMPLOYEE | Remove usuário |

**Body `POST /users`:**
```json
{
  "name": "string",
  "email": "string",
  "pass": "string",
  "type": "user | employee",
  "address": {
    "zipCode": "string"
  }
}
```

### 9.5 Especialidades

| Método | Endpoint | Auth | Perfil | Descrição |
|---|---|---|---|---|
| `GET` | `/specialities` | Sim | Qualquer | Lista todas as especialidades |
| `POST` | `/specialities` | Sim | EMPLOYEE | Cria especialidade |
| `DELETE` | `/specialities/:id` | Sim | EMPLOYEE | Remove especialidade |

### 9.6 Slots (Horários)

| Método | Endpoint | Auth | Perfil | Descrição |
|---|---|---|---|---|
| `GET` | `/slots` | Sim | Qualquer | Lista slots (query: `?specialityId=&fields=`) |
| `POST` | `/slots` | Sim | EMPLOYEE | Cria slots de horários |
| `GET` | `/slots/:id` | Sim | EMPLOYEE | Busca slot por ID |

**Body `POST /slots`:**
```json
{
  "specialityId": "string",
  "doctorName": "string",
  "availableDate": [
    { "date": "YYYY-MM-DD", "time": "HH:mm" }
  ]
}
```

### 9.7 Agendamentos

| Método | Endpoint | Auth | Perfil | Descrição |
|---|---|---|---|---|
| `POST` | `/appointments` | Sim | Qualquer | Cria agendamento |
| `GET` | `/appointments` | Sim | EMPLOYEE | Lista todos os agendamentos |
| `GET` | `/appointments/:userId` | Sim | Qualquer | Lista agendamentos do usuário |
| `DELETE` | `/appointments/:id` | Sim | EMPLOYEE | Cancela agendamento (query: `?availableDateId=`) |

**Body `POST /appointments`:**
```json
{
  "slotId": "string",
  "availableDateId": "string",
  "userId": "string (opcional, usa token se omitido)"
}
```

### 9.8 Informações Externas

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/infos/address/:zipCode` | Não | Retorna endereço pelo CEP |
| `GET` | `/infos/weather/:city` | Sim | Retorna previsão do tempo (query: `?date=YYYY-MM-DD`) |

**Resposta `/infos/address/:zipCode`:**
```json
{
  "street": "string",
  "neighborhood": "string",
  "city": "string",
  "state": "string",
  "stateCode": "string"
}
```

**Resposta `/infos/weather/:city`:**
```json
{
  "maxTemp": "number",
  "minTemp": "number",
  "condition": {
    "text": "string",
    "icon": "string (URL)"
  }
}
```

---

## 10. AUTENTICAÇÃO E AUTORIZAÇÃO

### 10.1 Fluxo de Autenticação

```
1. Cliente → POST /auth/login { email, pass }
2. AuthService.login:
   a. UserRepository.findByEmail(email)
   b. bcrypt.compare(pass, user.pass)
   c. Gera JWT: { userId, userType } com exp 15min
3. Resposta: { accessToken }
4. Cliente armazena token (sessionStorage)
5. Requisições subsequentes: Authorization: Bearer <token>
```

### 10.2 Estrutura do JWT

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userId": "uuid",
    "userType": "user | employee",
    "iat": 1234567890,
    "exp": 1234568790
  }
}
```

### 10.3 Segurança de Senha

- Algoritmo: bcrypt
- Salt rounds: 10
- Campos `pass` nunca retornados nas respostas públicas

### 10.4 Tipos de Perfil

| Perfil | Acesso |
|---|---|
| `user` | Cadastro, login, visualização e criação de próprios agendamentos, edição de conta |
| `employee` | Todos os acessos + gerenciamento de usuários, slots, especialidades e agendamentos |

---

## 11. MIDDLEWARES

### 11.1 authMiddleware (`src/middlewares/auth.middleware.ts`)

Valida o token JWT nas rotas protegidas.

1. Extrai o token do header `Authorization: Bearer <token>`;
2. Verifica assinatura e expiração com `JWT_SECRET`;
3. Popula `req.userId` e `req.userType`;
4. Retorna `401 Unauthorized` em caso de token inválido ou ausente.

### 11.2 accessMiddleware (`src/middlewares/access.middleware.ts`)

Valida se o perfil do usuário autenticado tem acesso ao recurso.

1. Recebe uma lista de perfis permitidos (ex.: `['employee']`);
2. Verifica se `req.userType` está na lista;
3. Retorna `403 Forbidden` se o perfil não for autorizado.

### 11.3 logsMiddleware (`src/middlewares/logs.middleware.ts`)

Integra o logger Pino com o Express via `pino-http`, registrando método, URL, status e tempo de resposta para cada requisição.

---

## 12. INTEGRAÇÕES EXTERNAS

### 12.1 ViaCEP

- **Finalidade:** Preenchimento automático de endereço a partir do CEP informado no cadastro.
- **URL base:** `https://viacep.com.br/ws`
- **Requisição:** `GET /{zipCode}/json/`
- **Implementação:** `AddressRepository` (injeção de AxiosInstance) → `AddressService` → `InfosController`
- **Tratamento de erro:** retorna `400` se o CEP for inválido ou não encontrado.

### 12.2 WeatherAPI

- **Finalidade:** Exibir a previsão do tempo para o dia da consulta no cartão de agendamento.
- **URL base:** `http://api.weatherapi.com/v1`
- **Requisição:** `GET /forecast.json?key={API_KEY}&q={city}&dt={date}&days=1&lang=pt`
- **Implementação:** `WeatherRepository` (injeção de AxiosInstance) → `WeatherService` → `InfosController`
- **Variável necessária:** `WEATHER_API_KEY` (gerada no painel da WeatherAPI)
- **Retorna:** temperatura máxima, mínima e condição com ícone.

---

## 13. CONFIGURAÇÃO DE AMBIENTE

### 13.1 Arquivo `.env` (api/)

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta da aplicação | `3000` |
| `API_PREFIX` | Prefixo das rotas | `api` |
| `API_VERSION` | Versão da API | `v1` |
| `DATABASE_URL` | URI de conexão MongoDB | `mongodb://admin:admin@localhost:27017/...` |
| `MONGO_USERNAME` | Usuário MongoDB | `admin` |
| `MONGO_PASSWORD` | Senha MongoDB | `admin` |
| `MONGO_DATABASE` | Nome do banco | `appointments_api` |
| `VIACEP_API` | URL base ViaCEP | `https://viacep.com.br/ws` |
| `WEATHER_API` | URL base WeatherAPI | `http://api.weatherapi.com` |
| `WEATHER_API_KEY` | Chave de acesso WeatherAPI | `<sua-chave>` |
| `WEATHER_API_DAY` | Dias de previsão | `1` |
| `JWT_SECRET` | Secret para access token | `<string-aleatória>` |

### 13.2 Docker — MongoDB

O MongoDB é executado em container Docker. A configuração está em `api/docker-compose.dependencies.yaml`.

```bash
# Subir o MongoDB
docker compose -f api/docker-compose.dependencies.yaml up -d
```

| Serviço | Porta |
|---|---|
| MongoDB | 27017 |

---

## 14. TESTES

### 14.1 Estrutura

```
__tests__/
├── setup.ts          # Define variáveis de ambiente para os testes
├── unit/             # Testes unitários de services e repositories
└── e2e/              # Testes de integração dos endpoints
```

### 14.2 Configuração

O arquivo `__tests__/setup.ts` define as variáveis de ambiente (`JWT_SECRET`, `API_PREFIX`, `API_VERSION`) necessárias para a execução dos testes sem depender do arquivo `.env`.

### 14.3 Padrão de Teste

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('AppointmentService', () => {
  it('deve criar agendamento com sucesso', async () => {
    // Arrange: mockar repositórios com vi.fn()
    // Act: chamar o método do serviço
    // Assert: verificar comportamento esperado
  })
})
```

### 14.4 Comandos

```bash
npm run test           # Todos os testes
npm run test:unit      # Apenas unitários
npm run test:e2e       # Apenas e2e
npm run test <arquivo> # Arquivo específico
```

---

## 15. EXECUÇÃO E DEPLOY

### 15.1 Instalação

```bash
# Na raiz do projeto
cd api
npm install
```

### 15.2 Desenvolvimento

```bash
# Configurar variáveis de ambiente
cp api/.env.example api/.env
# Editar api/.env com os valores corretos

# Subir MongoDB
docker compose -f api/docker-compose.dependencies.yaml up -d

# Iniciar API com hot-reload
npm run dev
```

### 15.3 Produção

```bash
npm run start
```

### 15.4 Linting

```bash
npm run lint
```

---

## 16. CÓDIGO-FONTE

Esta seção apresenta o código-fonte completo da API, organizado por camadas.

---

### 16.1 Entry Point e Configuração

#### `src/server.ts`
```typescript
import { app } from './app'
import connectDb from './infra/db/database'
import { logger } from './infra/logs'

const port = process.env.PORT || 3000

await connectDb()

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
```

#### `src/app.ts`
```typescript
import express from 'express'
import cors from 'cors'
import { router } from './routes'
import { logsMiddleware } from './middlewares'

const app = express()

app.use(express.json())
app.use(cors())
app.use(logsMiddleware)
app.use(`/${process.env.API_PREFIX}/${process.env.API_VERSION}`, router)

export { app }
```

#### `src/types/express.d.ts`
```typescript
declare namespace Express {
  interface Request {
    userId?: string
    userType?: string
  }
}
```

---

### 16.2 Infraestrutura

#### `src/infra/db/database.ts`
```typescript
import mongoose from 'mongoose'
import { logger } from '../logs'

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!)
    logger.info('MongoDB connected')
  } catch (error) {
    logger.error(error, 'MongoDB connection error')
  }
}

export default connectDb
```

#### `src/infra/logs/index.ts`
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
})
```

---

### 16.3 Middlewares

#### `src/middlewares/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express'
import { authService } from '../services'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = authService.verifyAccessToken(token)
    req.userId = payload.sub as string
    req.userType = payload.userType as string
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
```

#### `src/middlewares/access.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express'
import { USER_TYPE } from '../models/user'

type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE]

export function accessMiddleware(...allowedTypes: UserType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userType) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    next()
  }
}
```

#### `src/middlewares/logs.middleware.ts`
```typescript
import pinoHttp from 'pino-http'
import { logger } from '../infra/logs'

export const logsMiddleware = pinoHttp({ logger })
```

#### `src/middlewares/index.ts`
```typescript
export * from './auth.middleware'
export * from './logs.middleware'
export * from './access.middleware'
```

---

### 16.4 Rotas

#### `src/routes/index.ts`
```typescript
import { Router } from 'express'
import { appointmentsRouter } from './appointments'
import { specialtiesRouter } from './specialities'
import { slotsRouter } from './slots'
import { infosRouter } from './infos'
import { usersRouter } from './users'
import { authRouter } from './auth'

const router = Router()

router.get('/health/', (_req, res) => {
  res.send('OK')
})

router.use(appointmentsRouter)
router.use(specialtiesRouter)
router.use(slotsRouter)
router.use(infosRouter)
router.use(usersRouter)
router.use(authRouter)

export { router }
```

#### `src/routes/auth.ts`
```typescript
import { Router } from 'express'
import { authController } from '../controllers'
import { authMiddleware } from '../middlewares'

const authRouter = Router()

authRouter.post('/auth/login', authController.login)
authRouter.post('/auth/logout', authMiddleware, authController.logout)

export { authRouter }
```

#### `src/routes/users.ts`
```typescript
import { Router } from 'express'
import { userController } from '../controllers'
import { authMiddleware, accessMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const usersRouter = Router()

usersRouter.post('/users', userController.create)
usersRouter.get(
  '/users',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  userController.findAll,
)
usersRouter.get('/users/me', authMiddleware, userController.getUserInfo)
usersRouter.get('/users/:id', authMiddleware, userController.findById)
usersRouter.patch('/users/:id', authMiddleware, userController.update)
usersRouter.delete(
  '/users/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  userController.delete,
)

export { usersRouter }
```

#### `src/routes/appointments.ts`
```typescript
import { Router } from 'express'
import { appointmentsController } from '../controllers'
import { accessMiddleware, authMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const appointmentsRouter = Router()

appointmentsRouter.post('/appointments', authMiddleware, appointmentsController.save)
appointmentsRouter.get(
  '/appointments',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  appointmentsController.listAll,
)
appointmentsRouter.get('/appointments/:userId', authMiddleware, appointmentsController.listByUserId)
appointmentsRouter.delete(
  '/appointments/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  appointmentsController.delete,
)

export { appointmentsRouter }
```

#### `src/routes/slots.ts`
```typescript
import { Router } from 'express'
import { slotsController } from '../controllers'
import { accessMiddleware, authMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const slotsRouter = Router()

slotsRouter.get('/slots', authMiddleware, slotsController.listAll)
slotsRouter.post(
  '/slots',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  slotsController.create,
)
slotsRouter.get(
  '/slots/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  slotsController.findById,
)

export { slotsRouter }
```

#### `src/routes/specialities.ts`
```typescript
import { Router } from 'express'
import { specialtiesController } from '../controllers'
import { authMiddleware, accessMiddleware } from '../middlewares'
import { USER_TYPE } from '../models'

const specialtiesRouter = Router()

specialtiesRouter.get('/specialities', authMiddleware, specialtiesController.listAll)
specialtiesRouter.post(
  '/specialities',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  specialtiesController.create,
)
specialtiesRouter.delete(
  '/specialities/:id',
  authMiddleware,
  accessMiddleware(USER_TYPE.EMPLOYEE),
  specialtiesController.delete,
)

export { specialtiesRouter }
```

#### `src/routes/infos.ts`
```typescript
import { Router } from 'express'
import { infosController } from '../controllers'
import { authMiddleware } from '../middlewares'

const infosRouter = Router()

infosRouter.get('/infos/address/:zipCode', infosController.getAddress)
infosRouter.get('/infos/weather/:city', authMiddleware, infosController.getWeather)

export { infosRouter }
```

---

### 16.5 Controladores

#### `src/controllers/auth.controller.ts`
```typescript
import { Request, Response } from 'express'
import { authService, AuthService } from '../services'

export class AuthController {
  constructor(private authService: AuthService) {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  async login(req: Request, res: Response) {
    const { email, pass } = req.body

    if (!email || !pass) {
      return res.status(400).json({ error: 'Campo email e pass são obrigatórios' })
    }

    try {
      const tokens = await this.authService.login(email, pass)
      return res.status(200).json(tokens)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Usuário não encontrado') {
          return res.status(404).json({ error: error.message })
        }
        if (error.message === 'Senha inválida') {
          return res.status(401).json({ error: error.message })
        }
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async logout(req: Request, res: Response) {
    delete req.userId
    delete req.userType

    return res.status(204).send()
  }
}

export const authController = new AuthController(authService)
```

#### `src/controllers/user.controller.ts`
```typescript
import { Request, Response } from 'express'
import { userService, UserService, IUserUpdate } from '../services'
import { IUser } from '../repositories'
import { USER_TYPE } from '../models'

export class UserController {
  constructor(private userService: UserService) {
    this.create = this.create.bind(this)
    this.findAll = this.findAll.bind(this)
    this.findById = this.findById.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
  }

  async create(req: Request<IUser>, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Estão faltando alguns campos obrigatórios' })
      }

      await this.userService.create(req.body)
      return res.status(201).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll()
      return res.status(200).json(users)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const { id: userId } = req.params
    const { fields } = req.query

    try {
      const user = await this.userService.findById(userId, fields as string)
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async update(req: Request<{ id: string }, IUserUpdate>, res: Response) {
    const { id: userId } = req.params
    const userIdAuth = req.userId
    const userType = req.userType

    if (userId !== userIdAuth && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      await this.userService.update(userId, req.body)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const { id: userId } = req.params
    const userIdAuth = req.userId
    const userType = req.userType

    if (userId !== userIdAuth && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      await this.userService.delete(userId)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async getUserInfo(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { fields } = req.query
    try {
      const user = await this.userService.findById(userId, fields as string)
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const userController = new UserController(userService)
```

#### `src/controllers/appointments.controller.ts`
```typescript
import { Request, Response } from 'express'
import { appointmentService, AppointmentService } from '../services'
import { USER_TYPE } from '../models'

export class AppointmentsController {
  constructor(private appointmentService: AppointmentService) {
    this.save = this.save.bind(this)
    this.listAll = this.listAll.bind(this)
    this.listByUserId = this.listByUserId.bind(this)
    this.delete = this.delete.bind(this)
  }

  async save(req: Request, res: Response) {
    const { slotId, availableDateId, userId: bodyUserId } = req.body
    const authUserId = req.userId
    const userType = req.userType

    const userId = userType === USER_TYPE.EMPLOYEE && bodyUserId ? bodyUserId : authUserId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    if (!slotId || !availableDateId) {
      return res.status(400).json({ error: 'Campos "slotId" e "availableDateId" são obrigatórios' })
    }

    try {
      await this.appointmentService.create({ slotId, availableDateId, userId })
      return res.status(201).end()
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }

  async listAll(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    try {
      const result = await this.appointmentService.listAll()
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }

  async listByUserId(req: Request, res: Response) {
    const userIdAuth = req.userId
    const userType = req.userType
    const { userId } = req.params

    if (!userIdAuth) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    if (userIdAuth !== userId && userType !== USER_TYPE.EMPLOYEE) {
      return res.status(401).json({ error: 'Acesso negado' })
    }

    try {
      const result = await this.appointmentService.listByUserId(userId as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' })
    }

    const { id } = req.params
    const { availableDateId } = req.query
    if (!id || !availableDateId) {
      return res
        .status(400)
        .json({ error: 'ID do agendamento e ID da data disponíveis são obrigatórios' })
    }
    try {
      await this.appointmentService.delete(id as string, availableDateId as string)
      return res.status(204).end()
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
}

export const appointmentsController = new AppointmentsController(appointmentService)
```

#### `src/controllers/slots.controller.ts`
```typescript
import { Request, Response } from 'express'
import { slotService, SlotService } from '../services'

export class SlotsController {
  constructor(private slotService: SlotService) {
    this.listAll = this.listAll.bind(this)
    this.create = this.create.bind(this)
    this.findById = this.findById.bind(this)
  }

  async create(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { specialityId, doctorName, availableDate } = req.body

    if (!specialityId || !doctorName || !availableDate) {
      return res
        .status(400)
        .json({ error: 'specialityId, doctorName e availableDate são obrigatórios' })
    }

    if (!availableDate.length) {
      return res.status(400).json({ error: 'availableDate não pode ser vazio' })
    }

    try {
      await this.slotService.create({ specialityId, doctorName, availableDate })
      return res.status(201).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listAll(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { specialityId, fields } = req.query
    try {
      let slots = []
      if (specialityId) {
        slots = await this.slotService.listAvailable(specialityId as string, fields as string)
      } else {
        slots = await this.slotService.listAll(fields as string)
      }
      return res.status(200).json(slots)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async findById(req: Request, res: Response) {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { id } = req.params
    const { fields } = req.query

    if (!id) {
      return res.status(400).json({ error: 'id é obrigatório' })
    }
    try {
      const slot = await this.slotService.findById(id as string, fields as string)
      return res.status(200).json(slot)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const slotsController = new SlotsController(slotService)
```

#### `src/controllers/specialties.controller.ts`
```typescript
import { Request, Response } from 'express'
import { specialityService, SpecialityService } from '../services'

export class SpecialtiesController {
  constructor(private specialityService: SpecialityService) {
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.listAll = this.listAll.bind(this)
  }

  async create(req: Request, res: Response) {
    const userId = req.userId
    const { name } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' })
    }

    try {
      await this.specialityService.create(name)
      return res.status(201).json()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!id) {
      return res.status(400).json({ error: 'id é obrigatório' })
    }

    try {
      await this.specialityService.delete(id as string)
      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async listAll(_req: Request, res: Response) {
    try {
      const types = await this.specialityService.listAll()
      return res.status(200).json(types)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const specialtiesController = new SpecialtiesController(specialityService)
```

#### `src/controllers/infos.controller.ts`
```typescript
import { Request, Response } from 'express'
import { addressService, AddressService, weatherService, WeatherService } from '../services'

export class InfosController {
  constructor(
    private addressService: AddressService,
    private weatherService: WeatherService,
  ) {
    this.getAddress = this.getAddress.bind(this)
    this.getWeather = this.getWeather.bind(this)
  }

  async getAddress(req: Request, res: Response) {
    const { zipCode } = req.params

    if (!zipCode) {
      return res.status(400).json({ error: 'zipCode é obrigatório' })
    }

    try {
      const result = await this.addressService.getAddressByZipCode(zipCode as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  async getWeather(req: Request, res: Response) {
    const userId = req.userId
    const { city } = req.params
    const { date } = req.query

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!city) {
      return res.status(400).json({ error: 'city é obrigatório' })
    }

    try {
      const result = await this.weatherService.getWeatherByCity(city as string, date as string)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }
}

export const infosController = new InfosController(addressService, weatherService)
```

---

### 16.6 Serviços

#### `src/services/auth.service.ts`
```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserService, userService } from '../services'

export class AuthService {
  constructor(private userService: UserService) {}

  async login(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const isPasswordValid = await this.comparePassword(pass, user.pass)
    if (!isPasswordValid) {
      throw new Error('Senha inválida')
    }

    const accessToken = this.generateAccessToken(user.id, user.type)

    return { accessToken }
  }

  generateAccessToken(userId: string, userType: string): string {
    return jwt.sign({ sub: userId, userType }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  }

  verifyAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
  }

  private async comparePassword(pass: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(pass, hashedPassword)
  }
}

export const authService = new AuthService(userService)
```

#### `src/services/user.service.ts`
```typescript
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { IUser, IUserPublic, IUserPrivate, IUserRepository } from '../repositories'
import { UserRepository } from '../infra/repositories'
import { USER_STATUS, USER_TYPE } from '../models'

export type IUserUpdate = Partial<IUser>

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async create(data: IUser): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)
    if (user) {
      throw new Error('Email já cadastrado')
    }

    const isValid = this.validateData(data)
    if (!isValid) {
      throw new Error('Dados inválidos')
    }

    const dataCloned = { ...data }
    dataCloned.id = uuid()
    dataCloned.pass = await this.hashPassword(data.pass)

    await this.userRepository.create(dataCloned)
  }

  async findAll(): Promise<IUserPublic[]> {
    return await this.userRepository.findAll()
  }

  async findById(id: string, fields?: string): Promise<IUserPublic | null> {
    const user = await this.userRepository.findById(id, fields)
    if (!user) {
      return null
    }
    return user
  }

  async findByEmail(email: string): Promise<IUserPrivate | null> {
    return await this.userRepository.findByEmail(email)
  }

  async update(id: string, data: IUserUpdate): Promise<void> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Nenhum campo fornecido para atualização')
    }

    const { email, status, pass } = data

    if (email && !this.validateEmail(email)) {
      throw new Error('Email inválido')
    }
    if (status && !this.validateStatus(status)) {
      throw new Error('Status inválido')
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (pass) {
      const hashedPassword = await this.hashPassword(pass)
      data.pass = hashedPassword
    }

    await this.userRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    await this.userRepository.delete(id)
  }

  private validateData(data: IUser) {
    const { name, email, pass, type, status, address } = data
    if (!name || !email || !pass || !type) {
      return false
    }

    if (status && !this.validateStatus(status)) {
      return false
    }

    if (!type || !this.validateUserType(type)) {
      return false
    }

    if (type === USER_TYPE.USER && !address) {
      return false
    }

    return this.validateEmail(email)
  }

  private validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private validateUserType(type: string) {
    return type === USER_TYPE.USER || type === USER_TYPE.EMPLOYEE
  }

  private validateStatus(status: string) {
    return status === USER_STATUS.ACTIVE || status === USER_STATUS.INACTIVE
  }

  private async hashPassword(pass: string) {
    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    return await bcrypt.hash(pass, salt)
  }
}

export const userService = new UserService(new UserRepository())
```

#### `src/services/appointment.service.ts`
```typescript
import { v4 as uuidv4 } from 'uuid'
import { IAppointmentRepository, IAppointmentData } from '../repositories'
import { AppointmentRepository } from '../infra/repositories'
import {
  UserService,
  userService,
  SlotService,
  slotService,
  SpecialityService,
  specialityService,
  WeatherService,
  weatherService,
} from '.'

export interface IAppointmentListResponse extends Omit<
  IAppointmentData,
  'createdAt' | 'speciality'
> {
  speciality: string
}

export interface ICreateAppointmentData {
  slotId: string
  userId: string
  availableDateId: string
}

export class AppointmentService {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private specialityService: SpecialityService,
    private slotService: SlotService,
    private userService: UserService,
    private weatherService: WeatherService,
  ) {}

  async create(data: ICreateAppointmentData): Promise<void> {
    const { slotId, availableDateId, userId } = data

    const [user, slot] = await Promise.all([
      this.userService.findById(userId),
      this.slotService.findById(slotId),
    ])

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (!slot) {
      throw new Error('Slot não encontrado')
    }

    const speciality = await this.specialityService.findById(slot.specialityId)
    if (!speciality) {
      throw new Error('Tipo de consulta não encontrado')
    }

    const appointmentId = uuidv4()
    const bookedSlot = await this.slotService.bookSlot(slotId, availableDateId, appointmentId)

    const bookedDate = bookedSlot.availableDate.find((book) => book.appointmentId === appointmentId)
    if (!bookedDate) {
      await this.slotService.releaseSlot(appointmentId, availableDateId)
      throw new Error('Data do agendamento não encontrada após reserva')
    }

    const { id, date, time } = bookedDate

    await this.appointmentRepo
      .create({
        id: appointmentId,
        status: 'active',
        dateAppointment: { id, date, time },
        doctor: bookedSlot.doctor,
        speciality: {
          id: speciality.id,
          name: speciality.name,
        },
        userId,
        slotId,
      })
      .catch(async () => {
        await this.slotService.releaseSlot(appointmentId, availableDateId)
        throw new Error('Internal server error')
      })
  }

  async listAll(): Promise<IAppointmentListResponse[]> {
    const appointments = await this.appointmentRepo.findAll()

    return appointments.map((appointment) => ({
      ...appointment,
      speciality: appointment.speciality.name,
    }))
  }

  async listByUserId(userId: string): Promise<Record<string, unknown>[]> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const appointments = await this.list(user.id)

    if (!user.address?.city) {
      return appointments.map((appointment) => ({ ...appointment, weather: {} }))
    }

    return Promise.all(
      appointments.map(async (appointment) => {
        const weather = await this.weatherService.getWeatherByCity(
          user.address!.city,
          appointment.dateAppointment.date.split('-').reverse().join('-'),
        )

        if (!weather) {
          return { ...appointment, weather: {} }
        }

        return {
          ...appointment,
          weather: {
            condition: weather.condition,
            max: weather.maxTemp,
            min: weather.minTemp,
          },
        }
      }),
    )
  }

  async delete(appointmentId: string, availableDateId: string): Promise<void> {
    const deleted = await this.appointmentRepo.deleteById(appointmentId)
    if (!deleted) {
      throw new Error('Agendamento não encontrado')
    }

    await this.slotService.releaseSlot(appointmentId, availableDateId)
  }

  private async list(userId: string): Promise<IAppointmentListResponse[]> {
    const appointments = await this.appointmentRepo.findByUserId(userId)

    return appointments.map((appointment) => ({
      id: appointment.id,
      userId: appointment.userId,
      dateAppointment: appointment.dateAppointment,
      status: appointment.status,
      doctor: {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
      },
      speciality: appointment.speciality.name,
      slotId: appointment.slotId,
    }))
  }
}

export const appointmentService = new AppointmentService(
  new AppointmentRepository(),
  specialityService,
  slotService,
  userService,
  weatherService,
)
```

#### `src/services/slot.service.ts`
```typescript
import { v4 as uuidv4 } from 'uuid'
import { SlotRepository, SpecialityRepository } from '../infra/repositories'
import { ISlotBooked, ISlotData, ISlotRepository, ISpecialityRepository } from '../repositories'

export class SlotService {
  constructor(
    private slotRepo: ISlotRepository,
    private specialtyRepo: ISpecialityRepository,
  ) {}

  async create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void> {
    const type = await this.specialtyRepo.findById(data.specialityId)

    if (!type) {
      throw new Error('Tipo de consulta não existe')
    }

    if (!data.availableDate.length) {
      throw new Error('Data não informada')
    }
    const { availableDate, ...rest } = data
    const saveSlotData = {
      availableDate: availableDate.map((data) => ({
        ...data,
        id: uuidv4(),
        isBooked: false,
      })),
      ...rest,
    }

    await this.slotRepo.create(saveSlotData)
  }

  async listAll(fields?: string): Promise<ISlotData[]> {
    return await this.slotRepo.findAll(fields)
  }

  async listAvailable(specialityId: string, fields?: string): Promise<ISlotData[]> {
    return await this.slotRepo.findAvailable(specialityId, fields)
  }

  async findById(id: string, fields?: string): Promise<ISlotData | null> {
    return await this.slotRepo.findById(id, fields)
  }

  async bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked> {
    const bookedSlot = await this.slotRepo.bookSlot(slotId, availableDateId, appointmentId)
    if (!bookedSlot) {
      throw new Error('Horário indisponível ou já ocupado')
    }

    return bookedSlot
  }

  async releaseSlot(appointmentId: string, availableDateId: string): Promise<void> {
    await this.slotRepo.releaseSlot(appointmentId, availableDateId)
  }
}

export const slotService = new SlotService(new SlotRepository(), new SpecialityRepository())
```

#### `src/services/speciality.service.ts`
```typescript
import { SpecialityRepository } from '../infra/repositories'
import { ISpecialityData, ISpecialityRepository } from '../repositories'

export class SpecialityService {
  constructor(private specialityRepo: ISpecialityRepository) {}

  async create(name: string): Promise<void> {
    const type = await this.specialityRepo.findByName(name)

    if (type) {
      throw new Error('Tipo de consulta já existe')
    }

    await this.specialityRepo.create(name)
  }

  async listAll(): Promise<ISpecialityData[]> {
    return this.specialityRepo.findAll()
  }

  async findById(id: string): Promise<ISpecialityData | null> {
    return this.specialityRepo.findById(id)
  }

  async delete(id: string): Promise<void> {
    const type = await this.specialityRepo.findById(id)

    if (!type) {
      throw new Error('Tipo de consulta não encontrado')
    }

    await this.specialityRepo.delete(id)
  }
}

export const specialityService = new SpecialityService(new SpecialityRepository())
```

#### `src/services/address.service.ts`
```typescript
import axios from 'axios'
import { IAddressRepository, ViaCEPResponse } from '../repositories'
import { AddressRepository } from '../infra/repositories'

export interface IAddressResponse {
  street: string
  neighborhood: string
  stateCode: string
  state: string
  zipCode: string
  city: string
}

export class AddressService {
  constructor(private infoRepo: IAddressRepository<ViaCEPResponse>) {}

  async getAddressByZipCode(zipCode: string): Promise<IAddressResponse> {
    const data = await this.infoRepo.getAddressByZipCode(zipCode)

    if (!data) {
      throw new Error('Erro ao consultar CEP')
    }
    const { logradouro, bairro, uf, estado, cep, localidade } = data

    return {
      street: logradouro,
      neighborhood: bairro,
      stateCode: uf,
      state: estado,
      zipCode: cep,
      city: localidade,
    }
  }
}

const httpClient = axios.create()

export const addressService = new AddressService(new AddressRepository(httpClient))
```

#### `src/services/weather.service.ts`
```typescript
import axios from 'axios'
import { IWeatherRepository, IWeatherApiResponse } from '../repositories'
import { WeatherRepository } from '../infra/repositories'

export interface IWeatherResponse {
  maxTemp: number
  minTemp: number
  condition: { text: string; icon: string }
}

export class WeatherService {
  constructor(private weatherRepo: IWeatherRepository<IWeatherApiResponse>) {}

  async getWeatherByCity(city: string, date?: string): Promise<IWeatherResponse | null> {
    const response = await this.weatherRepo.getWeatherByCity(city, date)

    const { forecast } = response
    if (!forecast.forecastday.length) {
      return null
    }

    return {
      maxTemp: forecast.forecastday[0].day.maxtemp_c,
      minTemp: forecast.forecastday[0].day.mintemp_c,
      condition: {
        text: forecast.forecastday[0].day.condition.text,
        icon: forecast.forecastday[0].day.condition.icon,
      },
    }
  }
}

const httpClient = axios.create()

export const weatherService = new WeatherService(new WeatherRepository(httpClient))
```

---

### 16.7 Interfaces de Repositório

#### `src/repositories/user.repository.interface.ts`
```typescript
import { USER_STATUS, USER_TYPE, IUserAddress } from '../models'

export interface IUser {
  id: string
  name: string
  email: string
  pass: string
  type: typeof USER_TYPE.USER | typeof USER_TYPE.EMPLOYEE
  address?: IUserAddress
  status?: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE
}

export type IUserPublic = Omit<IUser, 'pass'>
export type IUserPrivate = Omit<IUser, 'name' | 'email'>

export interface IUserRepository {
  create(user: IUser): Promise<void>
  update(id: string, data: Partial<IUser>): Promise<void>
  delete(id: string): Promise<void>
  findAll(): Promise<IUserPublic[]>
  findById(id: string, fields?: string): Promise<IUserPublic | null>
  findByEmail(email: string): Promise<IUserPrivate | null>
}
```

#### `src/repositories/appointment.repository.interface.ts`
```typescript
export interface IAppointmentData {
  id: string
  status: string
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  userId: string
  speciality: { id: string; name: string }
  createdAt: Date
  slotId: string
}

export interface IAppointmentRepository {
  create(data: Omit<IAppointmentData, 'createdAt'>): Promise<void>
  findAll(): Promise<IAppointmentData[]>
  findByUserId(userId: string): Promise<IAppointmentData[]>
  findById(id: string): Promise<IAppointmentData | null>
  deleteById(id: string): Promise<boolean>
}
```

#### `src/repositories/slot.repository.interface.ts`
```typescript
import { ISlotAvailableDate } from '../models'

export interface ISlotData {
  id: string
  specialityId: string
  doctorName: string
  availableDate: ISlotAvailableDate[]
  createdAt: Date
}

export interface ISlotBooked extends Omit<ISlotData, 'doctorName'> {
  doctor: {
    id: string
    name: string
  }
}

export interface ISlotRepository {
  create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void>
  findAll(fields?: string): Promise<ISlotData[]>
  findAvailable(specialityId: string, fields?: string): Promise<ISlotData[]>
  findById(id: string, fields?: string): Promise<ISlotData | null>
  bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked | null>
  releaseSlot(appointmentId: string, availableDateId: string): Promise<boolean>
}
```

#### `src/repositories/speciality.repository.interface.ts`
```typescript
export interface ISpecialityData {
  id: string
  name: string
  createdAt: Date
}

export interface ISpecialityRepository {
  create(name: string): Promise<void>
  delete(id: string): Promise<void>
  findAll(): Promise<ISpecialityData[]>
  findById(id: string): Promise<ISpecialityData | null>
  findByName(name: string): Promise<ISpecialityData | null>
}
```

#### `src/repositories/address.repository.interface.ts`
```typescript
export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export interface IAddressRepository<T = Record<string, unknown>> {
  getAddressByZipCode(zipCode: string): Promise<T | null>
}
```

---

### 16.8 Implementações de Repositório (Infra)

#### `src/infra/repositories/user.repository.ts`
```typescript
import { IUser, IUserPublic, IUserPrivate, IUserRepository } from '../../repositories'
import { User } from '../../models'
import { logger } from '../logs'

export class UserRepository implements IUserRepository {
  constructor() {}

  async create(data: IUser): Promise<void> {
    try {
      await User.create({
        createdAt: new Date(),
        ...data,
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar uma conta')
    }
  }

  async findAll(): Promise<IUserPublic[]> {
    try {
      return await User.find({}, { pass: 0, _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuários')
    }
  }

  async findById(id: string, fields?: string): Promise<IUserPublic | null> {
    try {
      const projection = this.setFields(fields)
      return await User.findOne({ id }, projection).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuário')
    }
  }

  async findByEmail(email: string): Promise<IUserPrivate | null> {
    try {
      return await User.findOne({ email }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao buscar usuário')
    }
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    try {
      await User.updateOne({ id }, { $set: data })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao atualizar usuário')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await User.deleteOne({ id })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar usuário')
    }
  }

  private setFields(fields?: string): Record<string, unknown> {
    const forbidden = new Set(['pass', '__v'])

    if (!fields) return { pass: 0, _id: 0, __v: 0 }

    const selected = Object.fromEntries(
      fields
        .trim()
        .split(',')
        .filter((f) => !forbidden.has(f))
        .map((f) => [f, 1]),
    )
    return { _id: 0, ...selected }
  }
}
```

#### `src/infra/repositories/appointment.repository.ts`
```typescript
import { Appointment } from '../../models'
import { IAppointmentData, IAppointmentRepository } from '../../repositories'
import { logger } from '../logs'

export class AppointmentRepository implements IAppointmentRepository {
  async create(data: Omit<IAppointmentData, 'createdAt'>): Promise<void> {
    try {
      await Appointment.create({
        ...data,
        createdAt: new Date(),
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar agendamento')
    }
  }

  async findAll(): Promise<IAppointmentData[]> {
    try {
      return await Appointment.find({}, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consultas')
    }
  }

  async findByUserId(userId: string): Promise<IAppointmentData[]> {
    try {
      return await Appointment.find({ userId }, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consultas por usuário')
    }
  }

  async findById(id: string): Promise<IAppointmentData | null> {
    try {
      return await Appointment.findOne({ id }, { _id: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar consulta por id')
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const deleted = await Appointment.findOneAndDelete({ id })
      return deleted !== null
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar consulta')
    }
  }
}
```

#### `src/infra/repositories/slot.repository.ts`
```typescript
import { v4 as uuidv4 } from 'uuid'
import { Slot } from '../../models'
import { ISlotData, ISlotRepository, ISlotBooked } from '../../repositories'
import { logger } from '../logs'

export class SlotRepository implements ISlotRepository {
  async create(data: Omit<ISlotData, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { specialityId, doctorName, ...rest } = data
      await Slot.create({
        id: uuidv4(),
        specialityId: specialityId,
        doctor: {
          id: uuidv4(),
          name: doctorName,
        },
        ...rest,
      })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar slot')
    }
  }

  async findAll(fields?: string): Promise<ISlotData[]> {
    try {
      const projection = this.setFields(fields)
      const results = await Slot.find({}, projection).lean()

      return results.map((doc) => ({
        ...doc,
        availableDate: doc.availableDate?.map(({ _id, ...rest }) => rest),
      })) as unknown as ISlotData[]
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar slots')
    }
  }

  async findAvailable(specialityId: string, fields?: string): Promise<ISlotData[]> {
    try {
      const results = await Slot.aggregate([
        {
          $match: {
            specialityId,
            availableDate: { $elemMatch: { isBooked: false } },
          },
        },
        {
          $addFields: {
            availableDate: {
              $filter: {
                input: '$availableDate',
                as: 'slot',
                cond: { $eq: ['$$slot.isBooked', false] },
              },
            },
          },
        },
        { $project: this.setAggregateFields(fields) },
      ])

      return results as unknown as ISlotData[]
    } catch (error) {
      logger.error(error, 'Erro ao encontrar slots disponíveis')
      throw new Error('Erro ao encontrar slots disponíveis')
    }
  }

  async findById(id: string, fields?: string): Promise<ISlotData | null> {
    try {
      const projection = this.setFields(fields)
      const result = await Slot.findOne({ id }, projection).lean()
      if (!result) return null
      return {
        ...result,
        availableDate: result.availableDate?.map(({ _id, ...rest }) => rest),
      } as unknown as ISlotData
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar slot')
    }
  }

  async bookSlot(
    slotId: string,
    availableDateId: string,
    appointmentId: string,
  ): Promise<ISlotBooked | null> {
    try {
      return await Slot.findOneAndUpdate(
        { id: slotId, 'availableDate.isBooked': false, 'availableDate.id': availableDateId },
        {
          $set: {
            'availableDate.$.isBooked': true,
            'availableDate.$.appointmentId': appointmentId,
          },
        },
        { returnDocument: 'after' },
      )
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao reservar slot')
    }
  }

  async releaseSlot(appointmentId: string, availableDateId: string): Promise<boolean> {
    try {
      const result = await Slot.findOneAndUpdate(
        { 'availableDate.appointmentId': appointmentId, 'availableDate.id': availableDateId },
        { $set: { 'availableDate.$.isBooked': false, 'availableDate.$.appointmentId': null } },
      )
      return result !== null
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao liberar slot')
    }
  }

  private setAggregateFields(fields?: string): Record<string, unknown> {
    const forbidden = new Set(['__v', 'availableDate._id'])

    if (!fields) return { _id: 0, __v: 0, 'availableDate._id': 0 }

    const selected = Object.fromEntries(
      fields
        .trim()
        .split(',')
        .filter((f) => !forbidden.has(f))
        .map((f) => [f, 1]),
    )
    return { _id: 0, ...selected }
  }

  private setFields(fields?: string): Record<string, unknown> {
    return fields
      ? Object.fromEntries([
          ['_id', 0],
          ...fields
            .trim()
            .split(',')
            .map((f) => [f, 1]),
        ])
      : { _id: 0, __v: 0 }
  }
}
```

#### `src/infra/repositories/speciality.repository.ts`
```typescript
import { v4 as uuidv4 } from 'uuid'
import { Speciality } from '../../models'
import { ISpecialityData, ISpecialityRepository } from '../../repositories'
import { logger } from '../logs'

export class SpecialityRepository implements ISpecialityRepository {
  async create(name: string): Promise<void> {
    try {
      await Speciality.create({ id: uuidv4(), name })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao criar tipo de consulta')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Speciality.deleteOne({ id })
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao deletar tipo de consulta')
    }
  }

  async findAll(): Promise<ISpecialityData[]> {
    try {
      return await Speciality.find({}, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipos de consulta')
    }
  }

  async findById(id: string): Promise<ISpecialityData | null> {
    try {
      return await Speciality.findOne({ id }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipo de consulta')
    }
  }

  async findByName(name: string): Promise<ISpecialityData | null> {
    try {
      return await Speciality.findOne({ name }, { _id: 0, __v: 0 }).lean()
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao encontrar tipo de consulta')
    }
  }
}
```

#### `src/infra/repositories/address.repository.ts`
```typescript
import { AxiosInstance } from 'axios'
import { IAddressRepository, ViaCEPResponse } from '../../repositories'
import { logger } from '../logs'

export class AddressRepository implements IAddressRepository<ViaCEPResponse> {
  constructor(private http: AxiosInstance) {}

  async getAddressByZipCode(zipCode: string): Promise<ViaCEPResponse | null> {
    try {
      const response = await this.http.get<ViaCEPResponse | { erro: string }>(
        `${process.env.VIACEP_API}/${zipCode}/json/`,
      )
      if ('erro' in response.data) {
        return null
      }

      return response.data as ViaCEPResponse
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao tentar consultar CEP')
    }
  }
}
```

#### `src/infra/repositories/weather.repository.ts`
```typescript
import { AxiosInstance } from 'axios'
import { IWeatherApiResponse, IWeatherRepository } from '../../repositories'
import { logger } from '../logs'

export class WeatherRepository implements IWeatherRepository<IWeatherApiResponse> {
  constructor(private http: AxiosInstance) {}
  async getWeatherByCity(city: string, date?: string): Promise<IWeatherApiResponse> {
    try {
      const response = await this.http.get<IWeatherApiResponse>(
        `${process.env.WEATHER_API}/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&dt=${date ?? ''}&days=${process.env.WEATHER_API_DAY}&lang=pt`,
      )
      return response.data
    } catch (error) {
      logger.error(error)
      throw new Error('Erro ao tentar consultar clima')
    }
  }
}
```

---

### 16.9 Modelos Mongoose

#### `src/models/appointment.ts`
```typescript
import mongoose, { Document } from 'mongoose'

interface IAppointment extends Document {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  dateAppointment: { id: string; date: string; time: string }
  doctor: { id: string; name: string }
  userId: string
  speciality: { id: string; name: string }
  slotId: string
}

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dateAppointment: {
    id: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  doctor: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  userId: { type: String, required: true, index: true },
  speciality: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  slotId: { type: String, required: true, index: true },
})

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)
```

#### `src/models/slot.ts`
```typescript
import mongoose, { Document } from 'mongoose'

export interface ISlotAvailableDate {
  _id?: string
  id: string
  date: string
  time: string
  isBooked: boolean
  appointmentId: string | null
}

interface ISlot extends Document {
  id: string
  specialityId: string
  doctor: { id: string; name: string }
  availableDate: ISlotAvailableDate[]
  createdAt: Date
}

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  specialityId: { type: String, required: true },
  doctor: {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
  },
  availableDate: [
    {
      id: { type: String, required: true, index: true, unique: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      isBooked: { type: Boolean, required: true, default: false },
      appointmentId: { type: String, default: null },
    },
  ],
  createdAt: { type: Date, required: true, default: Date.now },
})

export const Slot = mongoose.model<ISlot>('Slot', slotSchema)
```

#### `src/models/speciality.ts`
```typescript
import mongoose, { Document } from 'mongoose'

export interface ISpeciality extends Document {
  id: string
  name: string
  createdAt: Date
}

const specialitySchema = new mongoose.Schema({
  id: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Speciality = mongoose.model<ISpeciality>('Speciality', specialitySchema)
```

---

## 17. REFERÊNCIAS

MOZILLA DEVELOPER NETWORK. **HTTP response status codes**. Disponível em: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status. Acesso em: mar. 2026.

OPENJS FOUNDATION. **Express.js documentation**. Disponível em: https://expressjs.com. Acesso em: mar. 2026.

MONGODB, INC. **Mongoose documentation**. Disponível em: https://mongoosejs.com/docs. Acesso em: mar. 2026.

AUTH0. **JSON Web Tokens introduction**. Disponível em: https://jwt.io/introduction. Acesso em: mar. 2026.

VIACEP. **API de consulta de CEP**. Disponível em: https://viacep.com.br. Acesso em: mar. 2026.

WEATHER API. **WeatherAPI documentation**. Disponível em: https://www.weatherapi.com/docs. Acesso em: mar. 2026.

MARTIN, Robert C. **Clean Architecture: a craftsman's guide to software structure and design**. Upper Saddle River: Prentice Hall, 2017.

FOWLER, Martin. **Patterns of enterprise application architecture**. Boston: Addison-Wesley, 2002.

---

*Documento gerado em março de 2026.*
