---
description: Backend API workflow for api_agenda
---

# Backend API Workflow

This workflow provides common commands for managing the `api_agenda` backend.

// turbo
1. Run Prisma generate
npx prisma generate

// turbo
2. Run Prisma migrations
npx prisma migrate dev --name init

// turbo
3. Start the development server
npm run dev

// turbo
4. Run tests
npm test

// turbo
5. Build the project
npm run build
