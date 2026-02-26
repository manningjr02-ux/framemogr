-- Store selected person by id (from detected_people) for overlay selection flow.
-- Does NOT remove any existing columns.

alter table analyses
  add column if not exists selected_person_id text;

comment on column analyses.selected_person_id is 'Id of selected person in detected_people; set when user selects via overlay.';
