# Agendamento Consultas

Sistema web para agendamento de consultas médicas com autenticação, integração com APIs externas e painel administrativo para funcionários.

## Funcionalidades

- Cadastro e login de usuários (pacientes e funcionários) com autenticação JWT
- Agendamento de consultas com verificação de horários disponíveis
- Painel administrativo para gerenciamento de usuários, agenda, especialidades e consultas
- Consulta automática de endereço pelo CEP (ViaCEP)
- Previsão do tempo para o dia da consulta (WeatherAPI)
- Controle de acesso por tipo de usuário (paciente vs. funcionário)

## Tecnologias

### Backend (`api/`)

- Node.js + Express 5
- TypeScript + tsx
- MongoDB + Mongoose
- JWT (access token)
- Vitest (testes unitários e e2e)

### Frontend (`frontend/`)

- Vue 3 + TypeScript + Vite
- Pinia (gerenciamento de estado)
- Vue Router 5
- Vitest + Vue Test Utils

### Infraestrutura

- Docker + Docker Compose
- MongoDB (container)

## Pré-requisitos

- Node.js `>=20.19.0 || >=22.12.0`
- Docker e Docker Compose (para rodar via containers)

## Instalação e execução local

### 1. Configurar variáveis de ambiente

Copie os arquivos de exemplo e preencha os valores:

```bash
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
```

Variáveis necessárias na `api/.env`:

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão: `3000`) |
| `API_PREFIX` | Prefixo das rotas (ex: `api`) |
| `API_VERSION` | Versão da API (ex: `v1`) |
| `DATABASE_URL` | URI de conexão com o MongoDB |
| `MONGO_USERNAME` | Usuário do MongoDB |
| `MONGO_PASSWORD` | Senha do MongoDB |
| `MONGO_DATABASE` | Nome do banco de dados |
| `VIACEP_API` | URL base da API ViaCEP |
| `WEATHER_API` | URL base da WeatherAPI |
| `WEATHER_API_KEY` | Chave de acesso à WeatherAPI |
| `WEATHER_API_DAY` | Quantidade de dias para previsão |
| `JWT_SECRET` | Secret para geração do access token |

Variáveis necessárias na `frontend/.env`:

| Variável | Descrição |
|---|---|
| `VITE_AGENDAMENTO_API` | URL base da API (ex: `http://localhost:3000`) |

### 2. Instalar dependências

```bash
cd api && npm install
cd ../frontend && npm install
```

### 3. Rodar em desenvolvimento

```bash
# API (na pasta api/)
npm run dev

# Frontend (na pasta frontend/)
npm run dev
```

## Execução com Docker

```bash
docker compose up
```

Serviços disponíveis após subir os containers:

| Serviço | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:3000` |
| MongoDB | `localhost:27017` |

## Testes

### API

```bash
cd api
npm test             # todos os testes
npm run test:unit    # apenas unitários
npm run test:e2e     # apenas e2e
```

### Frontend

```bash
cd frontend
npm run test:unit
```

## Estrutura do projeto

```
agendamento-consultas/
├── api/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/ # interfaces
│   │   ├── infra/        # implementações + conexão DB
│   │   ├── models/       # schemas Mongoose
│   │   ├── routes/
│   │   └── middlewares/
│   └── __tests__/
├── frontend/             # SPA Vue 3
│   └── src/
│       ├── views/
│       ├── components/
│       ├── stores/       # Pinia
│       ├── router/
│       └── assets/
└── docker-compose.yml
```
