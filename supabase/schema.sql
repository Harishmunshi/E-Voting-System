create extension if not exists "pgcrypto";

create table if not exists election_settings (
  id boolean primary key default true,
  election_enabled boolean not null default false,
  results_locked boolean not null default true,
  results_published boolean not null default false,
  principal_approved_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint singleton_settings check (id = true)
);

insert into election_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  slug text not null unique,
  priority integer not null unique,
  gender text not null check (gender in ('boy', 'girl')),
  created_at timestamptz not null default now()
);

insert into positions (title, slug, priority, gender) values
  ('Head Boy', 'head-boy', 1, 'boy'),
  ('Head Girl', 'head-girl', 2, 'girl'),
  ('Vice Head Boy', 'vice-head-boy', 3, 'boy'),
  ('Vice Head Girl', 'vice-head-girl', 4, 'girl'),
  ('Junior Head Boy', 'junior-head-boy', 5, 'boy'),
  ('Junior Head Girl', 'junior-head-girl', 6, 'girl'),
  ('Sports Captain (Boy)', 'sports-captain-boy', 7, 'boy'),
  ('Sports Captain (Girl)', 'sports-captain-girl', 8, 'girl'),
  ('Cultural Head (Boy)', 'cultural-head-boy', 9, 'boy'),
  ('Cultural Head (Girl)', 'cultural-head-girl', 10, 'girl'),
  ('Discipline Head (Boy)', 'discipline-head-boy', 11, 'boy'),
  ('Discipline Head (Girl)', 'discipline-head-girl', 12, 'girl')
on conflict (slug) do nothing;

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  standard text not null,
  division text not null,
  roll_number integer not null,
  full_name text,
  has_voted boolean not null default false,
  voted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (standard, division, roll_number)
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references positions(id) on delete restrict,
  name text not null,
  standard text not null,
  division text,
  photo_url text,
  manifesto text,
  is_active boolean not null default true,
  vote_count integer not null default 0 check (vote_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidates_position_idx on candidates(position_id);
create index if not exists students_has_voted_idx on students(has_voted);

insert into candidates (position_id, name, standard, division, photo_url, manifesto, is_active)
select id, 'NOTA', 'All Classes', null, '/nota.png', 'None of the above.', true
from positions p
where not exists (
  select 1
  from candidates c
  where c.position_id = p.id
    and c.name = 'NOTA'
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function submit_anonymous_ballot(p_student_id uuid, p_votes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_positions integer;
  submitted_positions integer;
  vote_record jsonb;
  selected_candidate uuid;
  selected_position uuid;
begin
  if not exists (select 1 from election_settings where id = true and election_enabled = true) then
    raise exception 'Election is not enabled';
  end if;

  update students
  set has_voted = true, voted_at = now(), updated_at = now()
  where id = p_student_id and has_voted = false;

  if not found then
    raise exception 'Invalid student or student has already voted';
  end if;

  select count(*) into expected_positions from positions;
  select count(*) into submitted_positions from jsonb_array_elements(p_votes);

  if submitted_positions <> expected_positions then
    raise exception 'Incomplete ballot';
  end if;

  for vote_record in select * from jsonb_array_elements(p_votes)
  loop
    selected_position := (vote_record->>'position_id')::uuid;
    selected_candidate := (vote_record->>'candidate_id')::uuid;

    if not exists (
      select 1
      from candidates
      where id = selected_candidate
        and position_id = selected_position
        and is_active = true
    ) then
      raise exception 'Invalid candidate selection';
    end if;

    update candidates
    set vote_count = vote_count + 1, updated_at = now()
    where id = selected_candidate;
  end loop;
end;
$$;

alter table election_settings enable row level security;
alter table positions enable row level security;
alter table students enable row level security;
alter table candidates enable row level security;
alter table admin_audit_logs enable row level security;
