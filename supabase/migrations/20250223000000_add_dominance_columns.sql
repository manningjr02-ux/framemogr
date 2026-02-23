-- Add dominance ranking v2 storage
-- Does NOT remove any existing columns.

alter table analyses
  add column if not exists dominance_result_v2 jsonb,
  add column if not exists dominance_version text not null default 'v1';

comment on column analyses.dominance_result_v2 is 'Dominance ranking v2 output (people, user_label, user_rank, total_people); null if not run';
comment on column analyses.dominance_version is 'Dominance ranking version: v1 (from run) or v2 (from runDominanceRanking)';
