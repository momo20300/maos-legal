# LexAI — Legal Intelligence Platform

## Overview

LexAI is a premium AI-powered legal intelligence platform that provides expert legal guidance across EU, US, and Arabic jurisdictions. Users can ask questions about law, receive detailed answers with real law article numbers and jurisprudence citations, and manage consultations through a subscription model.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (shadcn/ui, Tailwind CSS, framer-motion, wouter)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Anthropic Claude (via Replit AI Integrations — no user API key required)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Architecture

- `artifacts/lexai/` — React + Vite frontend
- `artifacts/api-server/` — Express 5 API server
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/db/` — Drizzle ORM schema and DB client
- `lib/integrations-anthropic-ai/` — Anthropic AI client and utilities

## Key Features

- **AI Legal Chat**: Powered by Claude Sonnet 4.6 with specialized system prompts per jurisdiction
- **3 Jurisdiction Experts**: EU law expert (CJEU, TFEU, GDPR), US law expert (SCOTUS, USC), Arabic law expert (Sharia, GCC, national codes)
- **Real-time Streaming**: SSE streaming of AI responses with live typing effect
- **Legal Citations**: AI responses formatted with law article numbers and jurisprudence references
- **Subscription Tiers**: Free (5/mo), Professional ($49/mo, 100/mo), Expert ($199/mo, unlimited)
- **Multi-domain Coverage**: 14 legal domains across 3 jurisdictions
- **Dark/Light Mode**: Professional navy + gold design theme

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/anthropic/conversations` — List all conversations
- `POST /api/anthropic/conversations` — Create conversation (title, jurisdiction, legalDomain)
- `GET /api/anthropic/conversations/:id` — Get conversation with messages
- `DELETE /api/anthropic/conversations/:id` — Delete conversation
- `GET /api/anthropic/conversations/:id/messages` — List messages
- `POST /api/anthropic/conversations/:id/messages` — Send message (SSE streaming response)
- `GET /api/subscriptions/plans` — List subscription plans
- `GET /api/subscriptions/status` — Get current subscription status
- `GET /api/legal-domains` — List all legal domains
- `GET /api/legal-domains/stats` — Get platform stats

## Legal Disclaimer

LexAI provides AI-assisted legal information, not legal advice. Users should consult licensed attorneys for their specific situations. This is included in every AI response.

## Important Notes

- After each OpenAPI spec change, re-run codegen before using the updated types
- After modifying DB schema, run `pnpm --filter @workspace/db run push`
- The `lib/api-zod/src/index.ts` must only export `./generated/api` (orval regenerates this file incorrectly with duplicate types — it must be patched after codegen)
- AI_INTEGRATIONS_ANTHROPIC_BASE_URL and AI_INTEGRATIONS_ANTHROPIC_API_KEY are auto-configured via Replit AI Integrations
