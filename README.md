# Controle de Produção por Estoque (MVP)

Sistema web completo para controle de produtos, matérias-primas e simulação de produção sugerida com base no estoque disponível.

## Stack

- Backend: Spring Boot 3.4, Java 21, Maven, JPA, Flyway, PostgreSQL
- Frontend: React + Vite + TypeScript + Redux Toolkit + React Router + Axios
- Banco: PostgreSQL 16
- Testes:
  - Backend: JUnit + Mockito + MockMvc + Testcontainers
  - Frontend: Vitest + Testing Library
  - E2E: Cypress

## Estrutura

- `backend`: API REST
- `frontend`: aplicação web responsiva
- `docker-compose.yml`: execução completa com `postgres`, `backend` e `frontend`

## Como executar com Docker Compose

```bash
docker compose up --build
```

Acessos:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

Credenciais padrão do banco:

- database: `projedata`
- user: `projedata`
- password: `projedata`

## Como executar localmente (sem Docker)

### Backend

```bash
cd backend
mvn spring-boot:run
```

Variáveis opcionais:

- `DB_URL` (default: `jdbc:postgresql://localhost:5432/projedata`)
- `DB_USERNAME` (default: `projedata`)
- `DB_PASSWORD` (default: `projedata`)
- `CORS_ALLOWED_ORIGINS` (default: `http://localhost:5173`)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Variável opcional:

- `VITE_API_BASE_URL` (default: `http://localhost:8080/api`)

## Endpoints principais

### Products

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Raw materials

- `GET /api/raw-materials`
- `GET /api/raw-materials/{id}`
- `POST /api/raw-materials`
- `PUT /api/raw-materials/{id}`
- `DELETE /api/raw-materials/{id}`

### Product composition

- `GET /api/product-materials?productId={id}`
- `POST /api/product-materials`
- `PUT /api/product-materials/{id}`
- `DELETE /api/product-materials/{id}`

### Production suggestion

- `GET /api/production-plan/suggestions`

## Regra de simulação (RF004/RF008)

1. Ordena produtos por maior valor (desempate por código).
2. Usa estoque virtual em memória.
3. Calcula quantidade máxima possível por produto com `floor(estoque / quantidade necessária)`.
4. Consome estoque virtual ao sugerir cada produto.
5. Retorna itens sugeridos e valor total.
6. Não realiza baixa real no banco.

## Testes

### Backend

```bash
cd backend
mvn test
```

Observação: os testes de integração com Testcontainers (`ApiIntegrationTest`) são executados somente quando Docker está disponível no ambiente do teste. Sem Docker socket, eles ficam como `skipped` automaticamente.

### Frontend

```bash
cd frontend
npm run lint
npm run test
npm run build
```

### E2E (Cypress)

```bash
cd frontend
npm run e2e
```

## Cobertura dos requisitos funcionais

- RF001: CRUD de produtos (API + UI)
- RF002: CRUD de matérias-primas (API + UI)
- RF003: CRUD de associação produto/matéria-prima (API + UI dentro de produtos)
- RF004: consulta de produção possível via estoque (API)
- RF005: tela CRUD de produtos
- RF006: tela CRUD de matérias-primas
- RF007: UI de composição no cadastro de produtos
- RF008: tela de simulação de produção e valor total

## Regras de validação implementadas

- `code` obrigatório e único em produtos e matérias-primas
- `name` obrigatório
- `value > 0` para produto
- `stock_quantity >= 0` para matéria-prima
- `required_quantity > 0` para composição
- bloqueio de exclusão quando há associações (HTTP 409)
- padrão de erro JSON com: `timestamp`, `status`, `error`, `message`, `path`
