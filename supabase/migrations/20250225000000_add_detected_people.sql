-- Persistent storage of detected people per analysis (stable labels, detection runs once).
-- Does NOT remove any existing columns.

alter table analyses
  add column if not exists detected_people jsonb;

comment on column analyses.detected_people is 'Stored detection result: [{ id, label, box: {x,y,w,h}, confidence? }]. When set, detection is not re-run.';
