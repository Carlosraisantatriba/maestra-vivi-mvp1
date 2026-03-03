do $$
begin
  if not exists (select 1 from pg_type where typname = 'library_item_type') then
    create type library_item_type as enum ('tarea', 'lectura', 'dictado', 'practica');
  end if;
end $$;

alter table if exists library_items
  add column if not exists week_number int,
  add column if not exists type library_item_type,
  alter column ingestion_status set default 'pending';

update library_items
set week_number = greatest(1, least(40, coalesce(nullif(regexp_replace(week_label, '\\D', '', 'g'), ''), '1')::int))
where week_number is null;

update library_items
set type = case
  when lower(title) like '%dictado%' then 'dictado'::library_item_type
  when lower(title) like '%lectura%' then 'lectura'::library_item_type
  when lower(title) like '%práctica%' or lower(title) like '%practica%' then 'practica'::library_item_type
  else 'tarea'::library_item_type
end
where type is null;

alter table library_items
  alter column week_number set not null,
  add constraint library_items_week_number_chk check (week_number between 1 and 40);

alter table library_items
  alter column type set not null;

create index if not exists idx_library_items_parent_subject_week_type
on library_items(parent_id, subject, week_number, type);
