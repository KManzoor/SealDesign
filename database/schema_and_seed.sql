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
  status text default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create table if not exists standard_component_master (
  size_ref text primary key,
  abutment_code text,
  abutment_tapping text,
  drive_collar_code text,
  drive_tapping text
);

create table if not exists spring_master (
  size_ref text primary key,
  spring_dimension text,
  spring_code text,
  dor text,
  moc_code text
);

create table if not exists sleeve_gland_gasket_master (
  id uuid primary key default gen_random_uuid(),
  gland_type text,
  sleeve_code text,
  gasket_code text,
  pump_make text,
  pump_model text,
  moc_code text
);

create table if not exists pin_oring_master (
  id uuid primary key default gen_random_uuid(),
  pin_type text,
  pin_code text,
  bs_no text,
  oring_id text,
  cross_section text
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

insert into standard_component_master (size_ref, abutment_code, abutment_tapping, drive_collar_code, drive_tapping) values
('25', 'FB0001-25', 'M5X3X120', 'FB0002-25', 'M5 X 6 X 60'),
('30', 'FB0001-30', 'M5X3X120', 'FB0002-30', 'M5 X 6 X 60'),
('35', 'FB0001-35', 'M5X3X120', 'FB0002-35', 'M5 X 6 X 60')
on conflict (size_ref) do nothing;

insert into spring_master (size_ref, spring_dimension, spring_code, dor, moc_code) values
('25', '29 X 35 X 26 X 3 X 4 X RH', 'FB0034-29', 'R', 'S42'),
('28/1.125', '33 X 39 X 27 X 3 X 3.5 X RH', 'FB0034-33', 'R', 'S42'),
('35', '40 X 48 X 31.5 X 4 X 4', 'FB0034-40', 'R', 'S42')
on conflict (size_ref) do nothing;

insert into sleeve_gland_gasket_master (gland_type, sleeve_code, gasket_code, pump_make, pump_model, moc_code) values
('GL-A1', 'SL-50-MCPK', 'GK-OD-ID-L', 'KSB', 'MCPK', 'S1'),
('GL-B1', 'SL-50-UP', 'GK-OD-ID-L', 'KBL', 'UP', 'S1')
on conflict do nothing;

insert into pin_oring_master (pin_type, pin_code, bs_no, oring_id, cross_section) values
('Square Pin Sleeve', 'FB0013-OD', '39000BSNO', 'ID-001', 'CS-001'),
('Square Pin Gland', 'FB0014-OD', '39000BSNO', 'ID-002', 'CS-002')
on conflict do nothing;

insert into bom_master (product_type, item_no, component_name, drawing_pattern, qty) values
('Complete Seal', '1.0', 'Rotary Assembly', '39-SEALTYPE/SIZE-01', 1),
('Complete Seal', '2.0', 'Pump Sleeve', 'SL/SLEEVE SIZE-PUMP+MOC', 1),
('Complete Seal', '6.0', 'Gland Plate Assembly', 'GL-GLAND TYPE/SIZE-PUMP+MOC', 1)
on conflict do nothing;
