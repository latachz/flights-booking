# Flights Booking

## Requirements

- Node.js
- PostgreSQL

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and adjust the database URL if needed:

```bash
cp .env.example .env
```

Run migrations and seed the database:

```bash
npm run db:migrate
npm run db:seed
```

## Running the app

```bash
npm start
```

## Running tests

```bash
npm test
```
