do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'ingestion_status_type' and e.enumlabel = 'ready'
  ) then
    alter type ingestion_status_type add value 'ready';
  end if;
end $$;

update library_items
set ingestion_status = 'ready'
where ingestion_status = 'done';
