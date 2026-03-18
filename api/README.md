# API

API REST para agendamento de consultas médicas, com suporte a especialidades, slots de horário, informações de endereço via CEP e previsão do tempo.

## Stack

- **Runtime:** Node.js 24, TypeScript 5 com ESM (`"type": "module"`)
- **Framework:** Express 5
- **Banco de dados:** MongoDB via Mongoose
- **HTTP client:** axios (instância compartilhada via `axios.create()`, injetada nos repositórios)
- **Testes:** Vitest + Supertest
- **Linting/Formatação:** ESLint 10 (flat config) + Prettier — sem ponto-e-vírgula, aspas simples, 100 chars de largura

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000
API_PREFIX=api
API_VERSION=v1
DATABASE_URL=mongodb://admin:admin@localhost:27017/appointments_api?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_DATABASE=appointments_api
VIACEP_API=https://viacep.com.br/ws
WEATHER_API=http://api.weatherapi.com
WEATHER_API_KEY=sua_chave_aqui
WEATHER_API_DAY=1
JWT_SECRET=seu-secret-para-access-token
```

## Comandos

```bash
npm run dev    # Inicia servidor em modo desenvolvimento com hot-reload (tsx --watch)
npm start      # Inicia servidor em produção
npm test       # Executa todos os testes (unit + e2e)
npm run test:unit  # Testes unitários
npm run test:e2e   # Testes e2e
npm run lint   # Lint com ESLint
```

Para rodar um único teste:

```bash
npm run test <caminho-do-arquivo>
```

## Endpoints

As rotas são prefixadas com `API_PREFIX` e `API_VERSION` (ex: `/api/v1`).

### Usuários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/users` | — | Cria um usuário |
| `GET` | `/users` | employee | Lista todos os usuários |
| `GET` | `/users/me` | sim | Retorna dados do usuário autenticado |
| `GET` | `/users/:id` | sim | Detalhes de um usuário |
| `PATCH` | `/users/:id` | sim | Atualiza um usuário |
| `DELETE` | `/users/:id` | employee | Deleta um usuário |

**Criar um usuário (paciente)**

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "nome",
    "email": "email@example.com",
    "pass": "senha",
    "type": "user",
    "status": "active",
    "address": {
      "zipCode": "01310100",
      "street": "Avenida Paulista",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": { "name": "São Paulo", "code": "SP" }
    }
  }'
```

**Criar um usuário (funcionário)**

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "nome",
    "email": "email@example.com",
    "pass": "senha",
    "type": "employee",
    "status": "active"
  }'
```

**Listar todos os usuários** _(requer funcionário)_

```bash
curl http://localhost:3000/api/v1/users \
  -H 'Authorization: Bearer seu-access-token'
```

**Dados do usuário autenticado**

```bash
curl http://localhost:3000/api/v1/users/me \
  -H 'Authorization: Bearer seu-access-token'
```

---

### Agendamentos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/appointments` | sim | Cria um agendamento |
| `GET` | `/appointments` | employee | Lista todos os agendamentos |
| `GET` | `/appointments/:userId` | sim | Lista agendamentos por usuário |
| `DELETE` | `/appointments/:id` | sim | Deleta um agendamento |

**Criar agendamento**

```bash
curl -X POST http://localhost:3000/api/v1/appointments \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer seu-access-token' \
  -d '{
    "slotId": "slot-uuid",
    "availableDateId": "available-date-uuid"
  }'
```

**Listar agendamentos por usuário** _(apenas funcionário)_

```bash
curl http://localhost:3000/api/v1/appointments/<userId> \
  -H 'Authorization: Bearer seu-access-token'
```

**Deleta agendamento** _(apenas funcionário)_

```bash
curl -X DELETE 'http://localhost:3000/api/v1/appointments/<appointmentId>?availableDateId=<availableDateId>' \
  -H 'Authorization: Bearer seu-access-token'
```

---

### Especialidades

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/specialities` | sim | Lista especialidades |
| `POST` | `/specialities` | employee | Cria uma especialidade |
| `DELETE` | `/specialities/:id` | employee | Deleta uma especialidade |

**Listar especialidades**

```bash
curl http://localhost:3000/api/v1/specialities \
  -H 'Authorization: Bearer seu-access-token'
```

**Criar especialidade** _(apenas funcionário)_

```bash
curl -X POST http://localhost:3000/api/v1/specialities \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer seu-access-token' \
  -d '{
    "name": "Clínico Geral"
  }'
```

---

### Slots de Consulta

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/slots` | sim | Lista todos os slots |
| `GET` | `/slots/:id` | employee | Busca um slot pelo id |
| `POST` | `/slots` | employee | Cria um slot de consulta |

**Listar todos os slots**

```bash
curl http://localhost:3000/api/v1/slots \
  -H 'Authorization: Bearer seu-access-token'
```

**Buscar slot pelo id** _(requer funcionário)_

```bash
curl http://localhost:3000/api/v1/slots/<id> \
  -H 'Authorization: Bearer seu-access-token'
```

**Criar slot de consulta** _(requer funcionário)_

```bash
curl -X POST http://localhost:3000/api/v1/slots \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer seu-access-token' \
  -d '{
    "specialityId": "speciality-uuid",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. João Silva"
    },
    "availableDates": [
      { "dateTime": "2026-03-10T09:00:00.000Z" }
    ]
  }'
```

---

### Informações

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/infos/address/:zipCode` | — | Retorna endereço pelo CEP (ViaCEP) |
| `GET` | `/infos/weather/:city?date=yyyy-mm-dd` | sim | Retorna previsão do tempo por cidade e data (WeatherAPI) |

**Buscar endereço por CEP**

```bash
curl http://localhost:3000/api/v1/infos/address/01310100
```

**Buscar previsão do tempo**

```bash
curl 'http://localhost:3000/api/v1/infos/weather/São Paulo?date=2026-03-04' \
  -H 'Authorization: Bearer seu-access-token'
```

---

### Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/login` | — | Login de usuário |
| `POST` | `/auth/logout` | sim | Logout do usuário |

**Login**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "email@example.com",
    "pass": "senha"
  }'
```

**Logout**

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H 'Authorization: Bearer seu-access-token'
```

---

### Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica se a API está no ar |

```bash
curl http://localhost:3000/api/v1/health
```

## Arquitetura

```
src/
├── server.ts                   # Ponto de entrada — conecta ao MongoDB e inicia Express
├── app.ts                      # Configura Express: JSON body parser, CORS, logs, rotas
├── routes/
│   ├── index.ts                # Agrega todos os sub-roteadores + /health
│   ├── appointments.ts         # Rotas de agendamentos
│   ├── auth.ts                 # Rotas de autenticação
│   ├── specialities.ts         # Rotas de especialidades
│   ├── slots.ts                # Rotas de slots de consulta
│   ├── infos.ts                # Rotas de informações (CEP e clima)
│   └── users.ts                # Rotas de usuários
├── controllers/
│   ├── index.ts
│   ├── appointments.controller.ts
│   ├── auth.controller.ts
│   ├── specialties.controller.ts
│   ├── slots.controller.ts
│   ├── infos.controller.ts
│   └── user.controller.ts
├── services/
│   ├── index.ts
│   ├── appointment.service.ts
│   ├── auth.service.ts
│   ├── speciality.service.ts
│   ├── slot.service.ts
│   ├── address.service.ts      # Endereço via ViaCEP
│   ├── weather.service.ts      # Clima via WeatherAPI
│   └── user.service.ts
├── repositories/               # Interfaces dos repositórios
│   ├── index.ts
│   ├── appointment.repository.interface.ts
│   ├── speciality.repository.interface.ts
│   ├── slot.repository.interface.ts
│   ├── user.repository.interface.ts
│   ├── address.repository.interface.ts
│   └── weather.repository.interface.ts
├── models/                     # Modelos Mongoose
│   ├── index.ts
│   ├── user.ts
│   ├── appointment.ts
│   ├── slot.ts
│   └── speciality.ts
├── middlewares/
│   ├── index.ts
│   ├── auth.middleware.ts      # Valida JWT e injeta userId/userType no request
│   ├── access.middleware.ts    # Controle de acesso por tipo de usuário
│   └── logs.middleware.ts      # Logging via pino-http
└── infra/
    ├── db/
    │   └── database.ts         # Conexão com MongoDB (mongoose.connect)
    ├── logs/                   # Configuração do pino
    └── repositories/           # Implementações dos repositórios
        ├── index.ts
        ├── appointments.repository.ts
        ├── speciality.repository.ts
        ├── slot.repository.ts
        ├── user.repository.ts
        ├── address.repository.ts   # Chama ViaCEP via AxiosInstance injetada
        └── weather.repository.ts   # Chama WeatherAPI via AxiosInstance injetada
```

**Fluxo:** `Routes → Controllers → Services → Repositories → Infra/DB`

## Controle de Acesso

As rotas são protegidas por dois middlewares:

- **`authMiddleware`** — verifica o JWT e injeta `userId` e `userType` no request
- **`accessMiddleware(USER_TYPE.EMPLOYEE)`** — restringe a rota a funcionários

Tipos de usuário: `user` (paciente) e `employee` (funcionário).
