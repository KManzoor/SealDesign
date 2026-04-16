create extension if not exists pgcrypto;

create table if not exists roles (
  id uuid primary key,
  name text unique not null,
  is_admin boolean default false,
  description text,
  created_at timestamptz default now()
);

create table if not exists app_users (
  id uuid primary key,
  username text unique not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  email text,
  role_id uuid references roles(id),
  auth_user_id uuid unique,
  status text default 'Active',
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table app_users add column if not exists auth_user_id uuid;
alter table app_users add column if not exists last_login_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_users_auth_user_id_key'
  ) then
    alter table app_users add constraint app_users_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

create table if not exists user_access (
  id uuid primary key,
  user_id uuid references app_users(id),
  screen_name text not null,
  can_create boolean default false,
  can_read boolean default true,
  can_update boolean default false,
  can_delete boolean default false,
  created_at timestamptz default now()
);

create table if not exists user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  screen_name text,
  action_type text,
  remarks text,
  device_info text,
  timestamp timestamptz default now()
);

create table if not exists seal_configuration_txn (
  id uuid primary key,
  configuration_no text unique not null,
  attribute_type text,
  seal_type text,
  seal_size text,
  construction_type text,
  stationary_name text,
  api_plan text,
  pump_make text,
  pump_model text,
  pump_code text,
  moc_code text,
  generated_attribute text,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists seal_type_master (
  code text primary key,
  description text,
  balance_type text
);

create table if not exists moc_master (
  code text primary key,
  description text
);

create table if not exists pump_model_master (
  pump_make text not null,
  pump_model text not null,
  pump_code text not null,
  primary key (pump_make, pump_model)
);

create table if not exists stationary_rule_master (
  stationary_name text primary key,
  default_api_plan text not null,
  gland_code_0 text,
  gland_code_11 text,
  gland_code_1162 text,
  gland_code_52 text,
  gland_code_53 text,
  gland_code_54 text
);

create table if not exists gp_classification_master (
  attribute_type text primary key,
  output_pattern text,
  notes text
);

create table if not exists construction_master (
  construction_type text primary key,
  suffix_code text,
  api_plan text,
  api_code text,
  remarks text
);

create table if not exists bom_master (
  id uuid primary key default gen_random_uuid(),
  product_type text,
  item_no text,
  component_name text,
  drawing_pattern text,
  qty numeric default 1
);

insert into roles (id, name, is_admin, description) values
('00000000-0000-0000-0000-000000000001', 'Admin', true, 'Full access to all screens and menus'),
('00000000-0000-0000-0000-000000000002', 'Design User', false, 'Last screen prototype access only')
on conflict (name) do update set
  is_admin = excluded.is_admin,
  description = excluded.description;

insert into app_users (id, username, password_hash, first_name, last_name, email, role_id, status)
select
  v.id,
  v.username,
  v.password_hash,
  v.first_name,
  v.last_name,
  v.email,
  r.id,
  v.status
from (
  values
    ('10000000-0000-0000-0000-000000000001'::uuid, 'admin_design', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Admin', 'Design', 'admin_design@futureseal.local', 'Admin', 'Active'),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'design', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Design', 'User', 'design@futureseal.local', 'Design User', 'Active')
) as v(id, username, password_hash, first_name, last_name, email, role_name, status)
join roles r on r.name = v.role_name
on conflict (username) do update set
  password_hash = excluded.password_hash,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  role_id = excluded.role_id,
  status = excluded.status,
  updated_at = now();

-- Demo Supabase Auth users for JWT login.
-- Password for both seeded accounts remains: admin
do $$
declare
  admin_auth_id uuid := '30000000-0000-0000-0000-000000000001';
  design_auth_id uuid := '30000000-0000-0000-0000-000000000002';
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'auth'
      and table_name = 'users'
  ) then
    if not exists (select 1 from auth.users where email = 'admin_design@futureseal.local') then
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        admin_auth_id,
        'authenticated',
        'authenticated',
        'admin_design@futureseal.local',
        crypt('admin', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"admin_design"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
      );
    end if;

    begin
      insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        'admin_design@futureseal.local',
        admin_auth_id,
        format('{"sub":"%s","email":"%s"}', admin_auth_id, 'admin_design@futureseal.local')::jsonb,
        'email',
        now(),
        now(),
        now()
      ) on conflict do nothing;
    exception when others then
      null;
    end;

    if not exists (select 1 from auth.users where email = 'design@futureseal.local') then
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        design_auth_id,
        'authenticated',
        'authenticated',
        'design@futureseal.local',
        crypt('admin', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"design"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
      );
    end if;

    begin
      insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        'design@futureseal.local',
        design_auth_id,
        format('{"sub":"%s","email":"%s"}', design_auth_id, 'design@futureseal.local')::jsonb,
        'email',
        now(),
        now(),
        now()
      ) on conflict do nothing;
    exception when others then
      null;
    end;
  end if;
end $$;

update app_users set auth_user_id = '30000000-0000-0000-0000-000000000001' where username = 'admin_design';
update app_users set auth_user_id = '30000000-0000-0000-0000-000000000002' where username = 'design';

insert into user_access (id, user_id, screen_name, can_create, can_read, can_update, can_delete)
select
  '20000000-0000-0000-0000-000000000001'::uuid,
  u.id,
  'prototype',
  false,
  true,
  false,
  false
from app_users u
where u.username = 'design'
on conflict (id) do nothing;

insert into seal_type_master (code, description, balance_type) values
('EM70', 'Multi spring balance in NW70 retainer', 'Balance'),
('EM90', 'Multi spring balance in straight shaft', 'Balance'),
('ES70', 'Single spring balance in NW70 retainer', 'Balance'),
('EW70', 'Wave spring balance in NW70 retainer', 'Balance'),
('NS11', 'Single spring seal with O-ring packing', 'Unbalance'),
('NS10-C', 'Single spring seal with V packing', 'Unbalance'),
('NM20', 'Multi spring unbalance', 'Unbalance'),
('NW70', 'Wave spring unbalance equivalent to M7N', 'Unbalance')
on conflict (code) do nothing;

insert into moc_master (code, description) values
('S1', 'TC/TC/PTFE/SS316'),
('S2', 'TC/TC/PTFE/SS304'),
('S3', 'TC/TC/FKM/SS316'),
('S5', 'SIC/SIC/PTFE/SS316'),
('S7', 'SIC/SIC/FKM/SS316'),
('S42', 'SS316'),
('S43', 'SS304')
on conflict (code) do nothing;

insert into pump_model_master (pump_make, pump_model, pump_code) values
('KSB', 'MCPK', 'A1'),
('KSB', 'CPK SO', 'A2'),
('KSB', 'ETN', 'A3'),
('KBL', 'UP', 'B1'),
('KBL', 'DB', 'B2'),
('KBL', 'CPHM', 'B3'),
('WILO', 'SCP', 'J1')
on conflict (pump_make, pump_model) do nothing;

insert into stationary_rule_master (stationary_name, default_api_plan, gland_code_0, gland_code_11, gland_code_1162, gland_code_52, gland_code_53, gland_code_54) values
('L TYPE (ST1)', '0', 'G1', 'G11', 'G116', 'G52', 'G53', 'G54'),
('M TYPE (ST2)', '11', 'G1', 'G11', 'G116', 'G52', 'G53', 'G54'),
('T TYPE (ST3)', '11/62', 'G1', 'G11', 'G116', 'G52', 'G53', 'G54')
on conflict (stationary_name) do nothing;

insert into gp_classification_master (attribute_type, output_pattern, notes) values
('COMPLETE SEAL', '39-SEAL TYPE/SEAL SIZE-GLAND TYPE+PUMP MODEL + MOC', 'Complete seal with gland and pump code'),
('COMPLETE SEAL WITHOUT GLAND PLATE', '39-SEAL TYPE/SEAL SIZE+PUMP MODEL + MOC', 'Without gland plate'),
('COMPLETE SEAL WITHOUT GLAND PLATE AND WITHOUT SLEEVE', '39-SEAL TYPE/SEAL SIZE+STATIONARY + MOC', 'Without gland plate and sleeve')
on conflict (attribute_type) do nothing;

insert into construction_master (construction_type, suffix_code, api_plan, api_code, remarks) values
('Cartridge', 'G', '11/62', 'G162', 'G added just after seal type for cartridge designs'),
('Non Cartridge', '', '0', 'G1', 'Base configuration without cartridge suffix')
on conflict (construction_type) do nothing;

insert into bom_master (product_type, item_no, component_name, drawing_pattern, qty) values
('Complete Seal', '1.0', 'Rotary Assembly', '39-SEALTYPE/SIZE-01', 1),
('Complete Seal', '2.0', 'Pump Sleeve', 'SL/SLEEVE SIZE-PUMP+MOC', 1),
('Complete Seal', '6.0', 'Gland Plate Assembly', 'GL-GLAND TYPE/SIZE-PUMP+MOC', 1)
on conflict do nothing;
