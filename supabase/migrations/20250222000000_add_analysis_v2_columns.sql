-- Safe migration for FrameMog v2
-- Adds analysis_version and result_v2 to analyses. Does NOT remove any existing columns.

alter table analyses
  add column if not exists analysis_version text not null default 'v1',
  add column if not exists result_v2 jsonb;

-- Optional: add comment for documentation
comment on column analyses.analysis_version is 'Analysis pipeline version: v1 (legacy) or v2';
comment on column analyses.result_v2 is 'v2 analysis output; null for v1 analyses';
