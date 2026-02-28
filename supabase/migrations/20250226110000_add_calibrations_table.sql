-- Calibration records: analysis_id, selected_label, answers_json, version, created_at.

create table if not exists calibrations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  selected_label text not null,
  answers_json jsonb not null default '{}'::jsonb,
  version text not null default 'cal_v1',
  created_at timestamptz not null default now()
);

create index if not exists calibrations_analysis_id_idx on calibrations(analysis_id);
create index if not exists calibrations_analysis_label_idx on calibrations(analysis_id, selected_label);
