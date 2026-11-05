-- Inbetween landing page. Insert-only for anon, nothing readable from the client.
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  twitch_login text not null check (twitch_login ~ '^[a-z0-9_]{3,25}$'),
  avg_viewers text not null check (avg_viewers in ('<200', '200-500', '500-2k', '2k+')),
  language text not null check (language in ('EN', 'PT-BR', 'ES', 'Other')),
  email text check (email is null or char_length(email) <= 254),
  discord text check (discord is null or char_length(discord) <= 37),
  has_editor boolean not null,
  notes text check (notes is null or char_length(notes) <= 1000),
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint applications_has_contact check (email is not null or discord is not null)
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;
alter table public.waitlist enable row level security;

drop policy if exists "anon can apply" on public.applications;
create policy "anon can apply" on public.applications
  for insert to anon with check (true);

drop policy if exists "anon can join waitlist" on public.waitlist;
create policy "anon can join waitlist" on public.waitlist
  for insert to anon with check (true);

-- No select, update or delete policies: the anon key can write a row and read nothing back.
grant usage on schema public to anon;
grant insert on public.applications, public.waitlist to anon;
revoke select, update, delete on public.applications from anon;
revoke select, update, delete on public.waitlist from anon;
