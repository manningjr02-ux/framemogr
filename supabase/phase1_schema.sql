-- Phase 1 schema for framrmog
-- Run in Supabase SQL editor

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  image_path text not null,
  image_width int,
  image_height int,
  status text not null default 'queued',
  consent_confirmed boolean not null default false,
  selected_label text,
  current_score int,
  potential_score int,
  potential_delta int,
  ai_summary jsonb default '{}'::jsonb,
  error_message text,
  constraint analyses_status_check check (
    status in ('queued', 'detecting', 'selecting', 'analyzing', 'complete', 'failed')
  )
);

create table if not exists analysis_people (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  label text not null,
  left_to_right_index int not null,
  sort_order int,
  dominance_score int,
  frame_authority int,
  fit_precision int,
  grooming_timing int,
  camera_positioning int,
  posture_control int,
  aura_expression int,
  strengths jsonb default '[]'::jsonb,
  weaknesses jsonb default '[]'::jsonb,
  free_insight_1 text,
  free_insight_2 text,
  face_crop_path text,
  crop_box jsonb default '{}'::jsonb
);

create index if not exists analysis_people_analysis_id_left_to_right_idx
  on analysis_people(analysis_id, left_to_right_index);

create index if not exists analysis_people_analysis_id_sort_order_idx
  on analysis_people(analysis_id, sort_order);
