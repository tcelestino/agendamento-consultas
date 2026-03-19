# Agendamento Consultas

Sistema web para agendamento de consultas médicas com autenticação, integração com APIs externas e painel administrativo para funcionários.

> [!IMPORTANT]
Apenas um estudo de caso para entendimento do conceito REST e aprendizado sobre Vue.js

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

#### Dependencias externas

- [Weather API](https://www.weatherapi.com/)
- [ViaCEP](https://viacep.com.br)

Mais detalhes no [README.md](https://github.com/tcelestino/agendamento-consultas/blob/main/api/README.md).

### Frontend (`frontend/`)

- Vue 3 + TypeScript + Vite
- Pinia (gerenciamento de estado)
- Vue Router 5
- Vitest + Vue Test Utils

Mais detalhes no [README.md](https://github.com/tcelestino/agendamento-consultas/blob/main/frontend/README.md).

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

| Variável | Descrição | Valor padrão |
|---|---|---|
| `PORT` | Porta da API | 3000 |
| `API_PREFIX` | Prefixo das rotas | api | 
| `API_VERSION` | Versão da API | v1 |
| `DATABASE_URL` | URI de conexão com o MongoDB | mongodb://admin:admin@localhost:27017/appointments_api?authSource=admin |
| `MONGO_USERNAME` | Usuário do MongoDB | admin |
| `MONGO_PASSWORD` | Senha do MongoDB | admin |
| `MONGO_DATABASE` | Nome do banco de dados | appointments_api
| `VIACEP_API` | URL base da API ViaCEP | https://viacep.com.br/ws | 
| `WEATHER_API` | URL base da WeatherAPI | http://api.weatherapi.com | 
| `WEATHER_API_KEY` | Chave de acesso à WeatherAPI.  | Gere um token no painel | 
| `WEATHER_API_DAY` | Quantidade de dias para previsão | 1 | 
| `JWT_SECRET` | Secret para geração do access token | seu-secret-para-access-token |

Variáveis necessárias na `frontend/.env`:

| Variável | Descrição |
|---|---|
| `VITE_AGENDAMENTO_API` | URL base da API (ex: `http://localhost:3000`) |

### 2. Instalar dependências

```bash
cd api && npm install
cd ../frontend && npm install
```


### 3. MongoDB via Docker Compose

```bash
docker compose -f api/docker-compose.dependencies.yaml up -d
```
Serviço disponível após subir o container:

| Serviço | Endereço |
|---|---|
| MongoDB | `localhost:27017` |

### 4. Rodar aplicações

```bash
# API (na pasta api/)
npm run dev

# Frontend (na pasta frontend/)
npm run dev
```

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
