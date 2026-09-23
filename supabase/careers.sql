create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  department text,
  location text,
  employment_type text default 'Full-time',
  workplace_type text default 'Remote',
  short_description text,
  description text,
  responsibilities text,
  qualifications text,
  skills text,
  benefits text,
  salary_range text,
  application_deadline date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.careers
add column if not exists title text;

alter table public.careers
add column if not exists slug text;

alter table public.careers
add column if not exists department text;

alter table public.careers
add column if not exists location text;

alter table public.careers
add column if not exists employment_type text;

alter table public.careers
add column if not exists workplace_type text;

alter table public.careers
add column if not exists short_description text;

alter table public.careers
add column if not exists description text;

alter table public.careers
add column if not exists responsibilities text;

alter table public.careers
add column if not exists qualifications text;

alter table public.careers
add column if not exists skills text;

alter table public.careers
add column if not exists benefits text;

alter table public.careers
add column if not exists salary_range text;

alter table public.careers
add column if not exists application_deadline date;

alter table public.careers
add column if not exists status text;

alter table public.careers
add column if not exists created_at timestamptz default now();

alter table public.careers
add column if not exists updated_at timestamptz default now();

create or replace function public.generate_career_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base_slug := regexp_replace(
      lower(btrim(coalesce(new.title, 'career-opportunity'))),
      '[^a-z0-9]+',
      '-',
      'g'
    );

    base_slug := trim(both '-' from base_slug);

    if base_slug = '' then
      base_slug := 'career-opportunity';
    end if;

    new.slug :=
      left(base_slug, 100)
      || '-'
      || left(
        replace(gen_random_uuid()::text, '-', ''),
        8
      );
  end if;

  return new;
end;
$$;

drop trigger if exists careers_slug_trigger
on public.careers;

create trigger careers_slug_trigger
before insert on public.careers
for each row
execute function public.generate_career_slug();

create or replace function public.update_career_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists careers_updated_at_trigger
on public.careers;

create trigger careers_updated_at_trigger
before update on public.careers
for each row
execute function public.update_career_timestamp();

create index if not exists careers_status_idx
on public.careers(status);

create index if not exists careers_created_at_idx
on public.careers(created_at desc);

alter table public.careers
enable row level security;

revoke all
on public.careers
from anon, authenticated;

grant select
on public.careers
to anon, authenticated;

grant insert, update, delete
on public.careers
to authenticated;

drop policy if exists "Public can read published careers"
on public.careers;

create policy "Public can read published careers"
on public.careers
for select
to anon, authenticated
using (
  lower(coalesce(status, '')) in (
    'published',
    'open',
    'active'
  )
  or public.is_admin_user()
);

drop policy if exists "Authorized team can manage careers"
on public.careers;

create policy "Authorized team can manage careers"
on public.careers
for all
to authenticated
using (
  public.is_admin_user()
)
with check (
  public.is_admin_user()
);
