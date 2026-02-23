# Supabase setup for framrmog

## 1. Run the schema

1. Open your Supabase project
2. Go to **SQL Editor**
3. Paste the contents of `phase1_schema.sql`
4. Run it

## 2. Create storage buckets

In **Storage** → **New bucket**:

| Bucket        | Public |
|---------------|--------|
| group-uploads | No (private) |
| person-crops  | No (private) |

## 3. Add env vars to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in **Project Settings** → **API** (URL and keys).
