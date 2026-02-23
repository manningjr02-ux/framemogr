-- Add image dimensions for accurate overlay positioning
alter table analyses
  add column if not exists image_width int,
  add column if not exists image_height int;
