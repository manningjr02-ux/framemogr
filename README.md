# framrmog

Frame dominance analysis for group photos.

## Setup

### 1. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

**Optional:**
- `FRAME_MOG_VERSION` — Analysis pipeline: `v2` (default) or `v1`. Set `v1` to use the legacy pipeline (kill switch). Works in development and production.

- Supabase keys: **Project Settings** → **API**
- Bucket `group-uploads` must exist and be private
- See `supabase/README.md` for schema and bucket setup

### 2. Run migrations

Run `supabase/phase1_schema.sql` and `supabase/migrations/*.sql` in the Supabase SQL Editor.

### 3. Verify storage

`GET /api/debug/storage` — returns `{ ok: true }` if the service-role client can upload to `group-uploads`. Use for local debugging only.

## Upload flow

1. POST `/api/analysis/create` receives `multipart/form-data` with `file` and `consent`
2. File is validated (type, size ≤ 10MB)
3. Service-role client uploads to `group-uploads/phase1/<uuid>/original.<ext>`
4. `analyses` row is created and `{ analysisId }` returned
