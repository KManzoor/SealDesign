import type { AppUser, MenuItemConfig, MocOption, PumpOption, Role, SealType, StationaryRule, UserAccess } from '../types';

export const rolesSeed: Role[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Admin',
    is_admin: true,
    description: 'Full access to all screens',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Design User',
    is_admin: false,
    description: 'Access limited to last screen prototype',
  },
];

export const localUsersSeed: AppUser[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    username: 'admin_design',
    first_name: 'Admin',
    last_name: 'Design',
    email: 'admin_design@futureseal.local',
    status: 'Active',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role_id: rolesSeed[0].id,
    role: rolesSeed[0],
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    username: 'design',
    first_name: 'Design',
    last_name: 'User',
    email: 'design@futureseal.local',
    status: 'Active',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role_id: rolesSeed[1].id,
    role: rolesSeed[1],
  },
];

export const localAccessSeed: UserAccess[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    user_id: localUsersSeed[1].id,
    screen_name: 'prototype',
    can_create: false,
    can_read: true,
    can_update: false,
    can_delete: false,
  },
];

export const sealTypes: SealType[] = [
  { code: 'EM70', description: 'Multi spring balance in NW70 retainer', balanceType: 'Balance' },
  { code: 'EM90', description: 'Multi spring balance in straight shaft', balanceType: 'Balance' },
  { code: 'ES70', description: 'Single spring balance in NW70 retainer', balanceType: 'Balance' },
  { code: 'EW70', description: 'Wave spring balance in NW70 retainer', balanceType: 'Balance' },
  { code: 'NS11', description: 'Single spring seal with O-ring packing', balanceType: 'Unbalance' },
  { code: 'NS10-C', description: 'Single spring seal with V packing', balanceType: 'Unbalance' },
  { code: 'NM20', description: 'Multi spring unbalance', balanceType: 'Unbalance' },
  { code: 'NM70', description: 'Multi spring unbalance equivalent to M75', balanceType: 'Unbalance' },
  { code: 'NW70', description: 'Wave spring unbalance equivalent to M7N', balanceType: 'Unbalance' },
  { code: 'EMB20', description: 'Standard metal bellow seal', balanceType: 'Balance' },
];

export const mocOptions: MocOption[] = [
  { code: 'S1', desc: 'TC/TC/PTFE/SS316' },
  { code: 'S2', desc: 'TC/TC/PTFE/SS304' },
  { code: 'S3', desc: 'TC/TC/FKM/SS316' },
  { code: 'S5', desc: 'SIC/SIC/PTFE/SS316' },
  { code: 'S7', desc: 'SIC/SIC/FKM/SS316' },
  { code: 'S33', desc: 'SIC/SIC/PTFE/SS316/CAR/SIC/FKM/SS304' },
  { code: 'S42', desc: 'SS316' },
  { code: 'S43', desc: 'SS304' },
  { code: 'S44', desc: 'HAST C 276' },
  { code: 'S45', desc: 'S. DUPLEX 2207' },
];

export const pumpOptions: PumpOption[] = [
  { make: 'KSB', model: 'MCPK', pumpCode: 'A1' },
  { make: 'KSB', model: 'CPK SO', pumpCode: 'A2' },
  { make: 'KSB', model: 'ETN', pumpCode: 'A3' },
  { make: 'KSB', model: 'MEGACHEM', pumpCode: 'A4' },
  { make: 'KSB', model: 'KWPZ', pumpCode: 'A5' },
  { make: 'KBL', model: 'UP', pumpCode: 'B1' },
  { make: 'KBL', model: 'DB', pumpCode: 'B2' },
  { make: 'KBL', model: 'CPHM', pumpCode: 'B3' },
  { make: 'KBL', model: 'CE', pumpCode: 'B4' },
  { make: 'MICROFINISH', model: '0K', pumpCode: 'C1' },
  { make: 'MICROFINISH', model: '1K', pumpCode: 'C2' },
  { make: 'WILO', model: 'SCP', pumpCode: 'J1' },
  { make: 'WILO', model: 'DST', pumpCode: 'J2' },
  { make: 'WILO', model: 'MHIL', pumpCode: 'J3' },
  { make: 'WILO', model: 'MISO/PISO', pumpCode: 'J4' },
];

export const apiCodes: Record<string, string> = {
  '0': 'G1',
  '11': 'G11',
  '11/62': 'G116',
  '52': 'G52',
  '53': 'G53',
  '54': 'G54',
};

export const stationaryRules: Record<string, StationaryRule> = {
  'L TYPE (ST1)': { apiPlan: '0', glandCodes: { '0': 'G1', '11': 'G11', '11/62': 'G116', '52': 'G52', '53': 'G53', '54': 'G54' } },
  'M TYPE (ST2)': { apiPlan: '11', glandCodes: { '0': 'G1', '11': 'G11', '11/62': 'G116', '52': 'G52', '53': 'G53', '54': 'G54' } },
  'T TYPE (ST3)': { apiPlan: '11/62', glandCodes: { '0': 'G1', '11': 'G11', '11/62': 'G116', '52': 'G52', '53': 'G53', '54': 'G54' } },
};

export const menuSeed: MenuItemConfig[] = [
  { label: 'Dashboard', path: '/', screenName: 'dashboard', description: 'Overview for admin', roles: ['Admin'] },
  { label: 'Master Home', path: '/masters', screenName: 'masters', description: 'Admin master dashboard', roles: ['Admin'] },
  { label: 'GP Classification', path: '/masters/gp', screenName: 'gp-master', description: 'GP classification CRUD', roles: ['Admin'] },
  { label: 'Construction', path: '/masters/construction', screenName: 'construction-master', description: 'Construction rule CRUD', roles: ['Admin'] },
  { label: 'Seal Types', path: '/masters/seal-types', screenName: 'seal-types', description: 'Seal type CRUD', roles: ['Admin'] },
  { label: 'MOC Master', path: '/masters/moc', screenName: 'moc-master', description: 'MOC CRUD', roles: ['Admin'] },
  { label: 'Pump Models', path: '/masters/pumps', screenName: 'pump-master', description: 'Pump mapping CRUD', roles: ['Admin'] },
  { label: 'Stationary Rules', path: '/masters/stationary', screenName: 'stationary-master', description: 'Stationary rule CRUD', roles: ['Admin'] },
  { label: 'Configurations', path: '/configurations', screenName: 'configurations', description: 'Saved generated configurations', roles: ['Admin'] },
  { label: 'User Guide', path: '/guide', screenName: 'guide', description: 'Workbook and rules summary', roles: ['Admin'] },
  { label: 'Last Screen Prototype', path: '/prototype', screenName: 'prototype', description: 'Final attribute generator', roles: ['Admin', 'Design User'] },
];
