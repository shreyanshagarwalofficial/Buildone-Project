create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (
    role in (
      'super_admin',
      'admin',
      'moderator',
      'content_manager',
      'support_admin'
    )
  ),
  permissions jsonb not null default '{}'::jsonb,
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists account_status text not null default 'active';

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  ip_address inet,
  user_agent text,
  status text not null default 'allowed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  id integer primary key,
  platform_name text not null default 'BuildOne',
  support_email text,
  timezone text not null default 'Asia/Kolkata',
  default_language text not null default 'English',
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin_user(target_user uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = target_user
  );
$$;

create or replace function public.is_super_admin(target_user uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = target_user
    and role = 'super_admin'
  );
$$;

create or replace function public.get_my_admin_access()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  record_data public.admin_roles%rowtype;
begin
  select *
  into record_data
  from public.admin_roles
  where user_id = auth.uid();

  if record_data.user_id is null then
    return jsonb_build_object(
      'allowed', false
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'role', record_data.role,
    'permissions', record_data.permissions
  );
end;
$$;

create or replace function public.admin_suspend_user(
  target_user_id uuid,
  reason text default 'Administrative moderation action'
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Administrative permission required';
  end if;

  if public.is_super_admin(target_user_id) then
    raise exception 'A super administrator cannot be suspended through this action';
  end if;

  update public.profiles
  set account_status = 'suspended'
  where id = target_user_id;

  insert into public.admin_audit_logs (
    actor_id,
    action,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'suspend_user',
    target_user_id,
    jsonb_build_object('reason', reason)
  );

  return true;
end;
$$;

create or replace function public.admin_restore_user(
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Administrative permission required';
  end if;

  update public.profiles
  set account_status = 'active'
  where id = target_user_id;

  insert into public.admin_audit_logs (
    actor_id,
    action,
    target_id
  )
  values (
    auth.uid(),
    'restore_user',
    target_user_id
  );

  return true;
end;
$$;

create or replace function public.admin_assign_role(
  target_user_id uuid,
  target_role text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Super administrator permission required';
  end if;

  if target_role not in (
    'super_admin',
    'admin',
    'moderator',
    'content_manager',
    'support_admin'
  ) then
    raise exception 'Invalid administrative role';
  end if;

  insert into public.admin_roles (
    user_id,
    role,
    assigned_by
  )
  values (
    target_user_id,
    target_role,
    auth.uid()
  )
  on conflict (user_id)
  do update set
    role = excluded.role,
    assigned_by = excluded.assigned_by,
    updated_at = now();

  insert into public.admin_audit_logs (
    actor_id,
    action,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'assign_admin_role',
    target_user_id,
    jsonb_build_object('role', target_role)
  );

  return true;
end;
$$;

create or replace function public.admin_remove_admin(
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Super administrator permission required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'An administrator cannot remove their own role';
  end if;

  delete from public.admin_roles
  where user_id = target_user_id;

  insert into public.admin_audit_logs (
    actor_id,
    action,
    target_id
  )
  values (
    auth.uid(),
    'remove_admin_role',
    target_user_id
  );

  return true;
end;
$$;

alter table public.admin_roles enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.security_events enable row level security;
alter table public.platform_settings enable row level security;
alter table public.profiles enable row level security;

drop policy if exists admin_roles_select on public.admin_roles;
create policy admin_roles_select
on public.admin_roles
for select
to authenticated
using (
  public.is_admin_user(auth.uid())
);

drop policy if exists admin_roles_insert on public.admin_roles;
create policy admin_roles_insert
on public.admin_roles
for insert
to authenticated
with check (
  public.is_super_admin(auth.uid())
);

drop policy if exists admin_roles_update on public.admin_roles;
create policy admin_roles_update
on public.admin_roles
for update
to authenticated
using (
  public.is_super_admin(auth.uid())
)
with check (
  public.is_super_admin(auth.uid())
);

drop policy if exists admin_roles_delete on public.admin_roles;
create policy admin_roles_delete
on public.admin_roles
for delete
to authenticated
using (
  public.is_super_admin(auth.uid())
);

drop policy if exists admin_audit_select on public.admin_audit_logs;
create policy admin_audit_select
on public.admin_audit_logs
for select
to authenticated
using (
  public.is_admin_user(auth.uid())
);

drop policy if exists security_events_select on public.security_events;
create policy security_events_select
on public.security_events
for select
to authenticated
using (
  public.is_admin_user(auth.uid())
);

drop policy if exists platform_settings_select on public.platform_settings;
create policy platform_settings_select
on public.platform_settings
for select
to authenticated
using (
  public.is_admin_user(auth.uid())
);

drop policy if exists platform_settings_update on public.platform_settings;
create policy platform_settings_update
on public.platform_settings
for update
to authenticated
using (
  public.is_admin_user(auth.uid())
)
with check (
  public.is_admin_user(auth.uid())
);

drop policy if exists platform_settings_insert on public.platform_settings;
create policy platform_settings_insert
on public.platform_settings
for insert
to authenticated
with check (
  public.is_admin_user(auth.uid())
);

drop policy if exists admin_profiles_select on public.profiles;
create policy admin_profiles_select
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin_user(auth.uid())
);

grant execute on function public.get_my_admin_access() to authenticated;
grant execute on function public.admin_suspend_user(uuid, text) to authenticated;
grant execute on function public.admin_restore_user(uuid) to authenticated;
grant execute on function public.admin_assign_role(uuid, text) to authenticated;
grant execute on function public.admin_remove_admin(uuid) to authenticated;