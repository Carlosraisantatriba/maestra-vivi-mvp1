create extension if not exists "uuid-ossp";
create extension if not exists vector;

create type user_role as enum ('parent', 'child');
create type subject_type as enum ('math', 'language', 'english');
create type session_mode as enum ('task', 'practice', 'reading', 'dictation');
create type participant_type as enum ('child', 'parent', 'both');
create type input_type as enum ('text', 'voice', 'photo_result', 'photo_procedure', 'doc');
create type ingestion_status_type as enum ('pending', 'processing', 'done', 'error');
create type source_type as enum ('auto', 'manual');

create table if not exists profiles (
  id uuid primary key,
  role user_role not null,
  parent_id uuid references profiles(id) on delete set null,
  display_name text not null,
  grade text not null default '3ro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  subject subject_type not null,
  code text not null unique,
  name text not null,
  grade text not null,
  created_at timestamptz not null default now()
);

create table if not exists library_items (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references profiles(id) on delete cascade,
  child_id uuid references profiles(id) on delete set null,
  subject subject_type not null,
  week_label text not null,
  title text not null,
  file_path text not null,
  file_type text not null,
  ingestion_status ingestion_status_type not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists library_chunks (
  id bigint generated always as identity primary key,
  library_item_id uuid not null references library_items(id) on delete cascade,
  page_num int not null default 1,
  chunk_text text not null,
  embedding vector(1536),
  subject subject_type not null,
  week_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists library_item_skills (
  library_item_id uuid not null references library_items(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  confidence numeric(3,2) not null default 0.5,
  source source_type not null default 'auto',
  created_at timestamptz not null default now(),
  primary key (library_item_id, skill_id)
);

create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references profiles(id) on delete cascade,
  mode session_mode not null,
  participants participant_type not null,
  subject subject_type,
  week_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  skill_id uuid references skills(id) on delete set null,
  input_type input_type not null,
  prompt_context jsonb not null default '{}'::jsonb,
  model_response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  error_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skill_mastery (
  child_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  score int not null check (score >= 0 and score <= 100),
  updated_at timestamptz not null default now(),
  primary key (child_id, skill_id)
);

create index if not exists idx_library_items_parent_subject_week
on library_items(parent_id, subject, week_label);

create index if not exists idx_sessions_child_mode_created
on sessions(child_id, mode, created_at desc);

create index if not exists idx_attempts_session_created
on attempts(session_id, created_at desc);

create index if not exists idx_skill_mastery_child_score
on skill_mastery(child_id, score asc);

insert into skills(subject, code, name, grade)
values
  ('math', 'M3_ADD_SUB_1000', 'Suma y resta hasta 1000', '3ro'),
  ('math', 'M3_MULT_TABLES', 'Tablas de multiplicar', '3ro'),
  ('math', 'M3_DIV_SIMPLE', 'División simple', '3ro'),
  ('math', 'M3_PROBLEMS_1STEP', 'Problemas de un paso', '3ro'),
  ('language', 'L3_LECT_LITERAL', 'Comprensión literal', '3ro'),
  ('language', 'L3_LECT_INFER', 'Comprensión inferencial', '3ro'),
  ('language', 'L3_ORTO_BV', 'Ortografía b/v', '3ro'),
  ('language', 'L3_PUNTUACION', 'Puntuación básica', '3ro'),
  ('english', 'E3_BASIC_VOCAB', 'Vocabulario básico', '3ro'),
  ('english', 'E3_SIMPLE_SENTENCES', 'Oraciones simples', '3ro'),
  ('english', 'E3_DICTATION_SPELL', 'Spelling de dictado', '3ro')
on conflict (code) do nothing;
