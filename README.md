# Complemento del Colegio + Tutor IA (MVP1)

MVP1 para 3ro (Argentina) con Next.js App Router + TypeScript + Supabase + OpenAI.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth, Postgres, Storage)
- OpenAI: `gpt-5-mini`, `gpt-5.2`, `text-embedding-3-small`, `omni-moderation-latest`
- Deploy: Vercel

## Requisitos
- Node.js 20+
- Proyecto Supabase con bucket `library`
- Extensión `vector` habilitada en Postgres

## Setup local
1. Instalar dependencias:
```bash
npm install
```

2. Copiar envs:
```bash
cp .env.example .env.local
```

3. Completar variables en `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TUTOR_MODEL` (default `gpt-5-mini`)
- `TUTOR_MODEL_HARD` (default `gpt-5.2`)
- `EMBEDDING_MODEL` (default `text-embedding-3-small`)
- `MODERATION_MODEL` (default `omni-moderation-latest`)
- `TTS_ENABLED` (opcional)
- `APP_LOCALE=es-AR`

4. Ejecutar migración SQL:
- Archivo: `supabase/migrations/001_init_mvp1.sql`
- Correrla en SQL Editor de Supabase o con Supabase CLI.

5. Levantar dev server:
```bash
npm run dev
```

## Scripts
- `npm run dev`: desarrollo
- `npm run build`: build producción
- `npm run start`: correr build
- `npm run lint`: lint
- `npm run test:tutor`: tests de contrato JSON del tutor

## API implementada
- `POST /api/profile/create-child`
- `GET /api/profile/me`
- `POST /api/library/upload`
- `POST /api/library/ingest`
- `GET /api/library/list?subject=&week=`
- `GET /api/library/item/:id`
- `POST /api/tutor/message`
- `POST /api/tutor/task/answer-check`
- `POST /api/tutor/task/procedure-check`
- `POST /api/tutor/practice/start`
- `POST /api/tutor/reading/start`
- `POST /api/tutor/dictation/start`
- `GET /api/reports/parent/overview?child_id=`

## Prompts
Ubicados en `/prompts`:
- `system_tutor.md`
- `task_answer_check.md`
- `task_procedure_check.md`
- `dictation.md`
- `reading.md`

## Vercel deploy
1. Importar repo en Vercel.
2. Definir env vars del `.env.example` en Project Settings.
3. Deploy.
4. Verificar que Supabase bucket `library` exista y que la migración esté aplicada.

## Notas de alcance MVP
- Ingesta actual extrae texto básico desde archivo descargado; para PDFs escaneados/imágenes usa fallback de texto.
- Hard-cases multimodales quedan preparados para iteración de ticket 14 con parser/vision dedicado.
