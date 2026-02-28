-- Calibration wizard answers tied to analysis + selected_label.
-- Persisted after Apply Calibration on /calibrate.

alter table analyses
  add column if not exists calibration_data jsonb;

comment on column analyses.calibration_data is 'Calibration wizard answers { step1, step2, step3, step4 } keyed by selected_label or analysis.';
