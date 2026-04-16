export interface Role {
  id: string;
  name: string;
  is_admin: boolean;
  description?: string;
}

export interface AppUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  status: string;
  password_hash?: string;
  role_id?: string;
  role?: Role | null;
}

export interface UserAccess {
  id: string;
  user_id: string;
  screen_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface MenuItemConfig {
  label: string;
  path: string;
  screenName: string;
  description: string;
  roles: string[];
}

export interface SealType {
  code: string;
  description: string;
  balanceType: string;
}

export interface MocOption {
  code: string;
  desc: string;
}

export interface PumpOption {
  make: string;
  model: string;
  pumpCode: string;
}

export interface StationaryRule {
  apiPlan: string;
  glandCodes: Record<string, string>;
}

export interface StationaryMasterRow {
  stationary_name: string;
  default_api_plan: string;
  gland_code_0: string;
  gland_code_11: string;
  gland_code_1162: string;
  gland_code_52: string;
  gland_code_53: string;
  gland_code_54: string;
}

export interface SealConfigurationTxn {
  id: string;
  configuration_no: string;
  attribute_type: string;
  seal_type: string;
  seal_size: string;
  construction_type: string;
  stationary_name: string;
  api_plan: string;
  pump_make: string;
  pump_model: string;
  pump_code: string;
  moc_code: string;
  generated_attribute: string;
  created_by?: string;
  created_at?: string;
}

export interface GpClassification {
  attribute_type: string;
  output_pattern: string;
  notes: string;
}

export interface ConstructionMaster {
  construction_type: string;
  suffix_code: string;
  api_plan: string;
  api_code: string;
  remarks: string;
}

export interface BomMasterItem {
  id?: string;
  product_type: string;
  item_no: string;
  component_name: string;
  drawing_pattern: string;
  qty: number;
}
