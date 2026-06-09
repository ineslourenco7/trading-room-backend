# Hermes Trading Room Backend

Node.js + Express + Socket.io + PostgreSQL + Prisma backend for the Hermes Trading Room.

## Features

- Global trading room
- Asset tagging (BTCUSD, XAUUSD, EURUSD, etc.)
- Socket.io real-time messaging
- PostgreSQL persistence with Prisma
- Plan validation middleware
- Message history API

## Requirements

- Node.js 20+
- PostgreSQL

## Setup

```bash
npm install
cp .env.example .env
```

Update `.env`:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tradingroom
CORS_ORIGIN=http://localhost:3000
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Start development server:

```bash
npm run dev
```

## REST API

### Health

```http
GET /health
```

### Message history

```http
GET /api/messages
GET /api/messages?asset=XAUUSD
```

Headers:

```http
x-user-id: demo-user
x-user-name: Ines
x-user-plan: PRO
```

## Socket.io

Connection:

```ts
const socket = io("http://localhost:8080", {
  auth: {
    userId: "demo-user",
    name: "Ines",
    plan: "PRO"
  }
})
```

Change active asset:

```ts
socket.emit("asset:change", {
  asset: "XAUUSD"
})
```

Send message:

```ts
socket.emit("message:send", {
  asset: "XAUUSD",
  body: "Liquidity above 3365"
})
```

Listen:

```ts
socket.on("message:new", console.log)
socket.on("user:joined", console.log)
socket.on("user:left", console.log)
```
