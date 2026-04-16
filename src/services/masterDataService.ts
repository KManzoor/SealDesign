import { mocOptions as seedMocOptions, pumpOptions as seedPumpOptions, sealTypes as seedSealTypes, stationaryRules as seedStationaryRules } from '../data/seedData';
import { supabase } from '../lib/supabase';
import type { BomMasterItem, ConstructionMaster, GpClassification, MocOption, PumpOption, SealConfigurationTxn, SealType, StationaryMasterRow } from '../types';

const STORAGE_KEYS = {
  sealTypes: 'sealdesign:seal-types',
  mocs: 'sealdesign:moc-options',
  pumps: 'sealdesign:pump-options',
  stationary: 'sealdesign:stationary-rules',
  gp: 'sealdesign:gp-classification',
  construction: 'sealdesign:construction-master',
  bom: 'sealdesign:bom-master',
  configurations: 'sealdesign:configurations',
};

function loadLocal<T>(key: string, seed: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function saveLocal<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function mapSeedStationary(): StationaryMasterRow[] {
  return Object.entries(seedStationaryRules).map(([name, rule]) => ({
    stationary_name: name,
    default_api_plan: rule.apiPlan,
    gland_code_0: rule.glandCodes['0'] || '',
    gland_code_11: rule.glandCodes['11'] || '',
    gland_code_1162: rule.glandCodes['11/62'] || '',
    gland_code_52: rule.glandCodes['52'] || '',
    gland_code_53: rule.glandCodes['53'] || '',
    gland_code_54: rule.glandCodes['54'] || '',
  }));
}

function mapSeedGpClassification(): GpClassification[] {
  return [
    { attribute_type: 'COMPLETE SEAL', output_pattern: '39-SEAL TYPE/SEAL SIZE-GLAND TYPE+PUMP MODEL + MOC', notes: 'Complete seal with gland and pump model code' },
    { attribute_type: 'COMPLETE SEAL WITHOUT GLAND PLATE', output_pattern: '39-SEAL TYPE/SEAL SIZE+PUMP MODEL + MOC', notes: 'Without gland plate' },
    { attribute_type: 'COMPLETE SEAL WITHOUT GLAND PLATE AND WITHOUT SLEEVE', output_pattern: '39-SEAL TYPE/SEAL SIZE+STATIONARY + MOC', notes: 'Without gland plate and sleeve' },
  ];
}

function mapSeedConstruction(): ConstructionMaster[] {
  return [
    { construction_type: 'Non Cartridge', suffix_code: '', api_plan: '0', api_code: 'G1', remarks: 'Base construction' },
    { construction_type: 'Cartridge', suffix_code: 'G', api_plan: '11/62', api_code: 'G162', remarks: 'Cartridge construction with code after seal type' },
  ];
}

function mapSeedBom(): BomMasterItem[] {
  return [
    { product_type: 'COMPLETE SEAL', item_no: '1.0', component_name: 'Rotary Assembly', drawing_pattern: '39-SEALTYPE/SIZE-01', qty: 1 },
    { product_type: 'COMPLETE SEAL', item_no: '2.0', component_name: 'Pump Sleeve', drawing_pattern: 'SL/SLEEVE SIZE-PUMP+MOC', qty: 1 },
    { product_type: 'COMPLETE SEAL', item_no: '6.0', component_name: 'Gland Plate Assembly', drawing_pattern: 'GL-GLAND TYPE/SIZE-PUMP+MOC', qty: 1 },
    { product_type: 'COMPLETE SEAL WITHOUT GLAND PLATE', item_no: '1.0', component_name: 'Rotary Assembly', drawing_pattern: '39-SEALTYPE/SIZE-01', qty: 1 },
    { product_type: 'COMPLETE SEAL WITHOUT GLAND PLATE AND WITHOUT SLEEVE', item_no: '4.0', component_name: 'Stationary', drawing_pattern: 'STATIONARY TYPE', qty: 1 },
  ];
}

export async function listSealTypes(): Promise<SealType[]> {
  if (supabase) {
    const { data, error } = await supabase.from('seal_type_master').select('*').order('code');
    if (!error && Array.isArray(data)) {
      return data.map((item: any) => ({
        code: item.code,
        description: item.description || '',
        balanceType: item.balance_type || '',
      }));
    }
  }
  return loadLocal(STORAGE_KEYS.sealTypes, seedSealTypes);
}

export async function upsertSealType(item: SealType) {
  if (supabase) {
    const { error } = await supabase.from('seal_type_master').upsert({
      code: item.code,
      description: item.description,
      balance_type: item.balanceType,
    });
    if (error) throw error;
    return;
  }

  const items = loadLocal(STORAGE_KEYS.sealTypes, seedSealTypes);
  const next = [...items.filter((entry) => entry.code !== item.code), item].sort((a, b) => a.code.localeCompare(b.code));
  saveLocal(STORAGE_KEYS.sealTypes, next);
}

export async function deleteSealType(code: string) {
  if (supabase) {
    const { error } = await supabase.from('seal_type_master').delete().eq('code', code);
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.sealTypes, seedSealTypes).filter((item) => item.code !== code);
  saveLocal(STORAGE_KEYS.sealTypes, items);
}

export async function listMocOptions(): Promise<MocOption[]> {
  if (supabase) {
    const { data, error } = await supabase.from('moc_master').select('*').order('code');
    if (!error && Array.isArray(data)) {
      return data.map((item: any) => ({ code: item.code, desc: item.description || '' }));
    }
  }
  return loadLocal(STORAGE_KEYS.mocs, seedMocOptions);
}

export async function upsertMocOption(item: MocOption) {
  if (supabase) {
    const { error } = await supabase.from('moc_master').upsert({ code: item.code, description: item.desc });
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.mocs, seedMocOptions);
  const next = [...items.filter((entry) => entry.code !== item.code), item].sort((a, b) => a.code.localeCompare(b.code));
  saveLocal(STORAGE_KEYS.mocs, next);
}

export async function deleteMocOption(code: string) {
  if (supabase) {
    const { error } = await supabase.from('moc_master').delete().eq('code', code);
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.mocs, seedMocOptions).filter((item) => item.code !== code);
  saveLocal(STORAGE_KEYS.mocs, items);
}

export async function listPumpOptions(): Promise<PumpOption[]> {
  if (supabase) {
    const { data, error } = await supabase.from('pump_model_master').select('*').order('pump_make').order('pump_model');
    if (!error && Array.isArray(data)) {
      return data.map((item: any) => ({ make: item.pump_make, model: item.pump_model, pumpCode: item.pump_code }));
    }
  }
  return loadLocal(STORAGE_KEYS.pumps, seedPumpOptions);
}

export async function upsertPumpOption(item: PumpOption) {
  if (supabase) {
    const { error } = await supabase.from('pump_model_master').upsert({
      pump_make: item.make,
      pump_model: item.model,
      pump_code: item.pumpCode,
    }, { onConflict: 'pump_make,pump_model' });
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.pumps, seedPumpOptions);
  const key = `${item.make}__${item.model}`;
  const next = [...items.filter((entry) => `${entry.make}__${entry.model}` !== key), item].sort((a, b) => `${a.make}${a.model}`.localeCompare(`${b.make}${b.model}`));
  saveLocal(STORAGE_KEYS.pumps, next);
}

export async function deletePumpOption(make: string, model: string) {
  if (supabase) {
    const { error } = await supabase.from('pump_model_master').delete().eq('pump_make', make).eq('pump_model', model);
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.pumps, seedPumpOptions).filter((item) => !(item.make === make && item.model === model));
  saveLocal(STORAGE_KEYS.pumps, items);
}

export async function listStationaryRules(): Promise<StationaryMasterRow[]> {
  const seed = mapSeedStationary();
  if (supabase) {
    const { data, error } = await supabase.from('stationary_rule_master').select('*').order('stationary_name');
    if (!error && Array.isArray(data)) {
      return data as StationaryMasterRow[];
    }
  }
  return loadLocal(STORAGE_KEYS.stationary, seed);
}

export async function upsertStationaryRule(item: StationaryMasterRow) {
  if (supabase) {
    const { error } = await supabase.from('stationary_rule_master').upsert(item);
    if (error) throw error;
    return;
  }
  const seed = mapSeedStationary();
  const items = loadLocal(STORAGE_KEYS.stationary, seed);
  const next = [...items.filter((entry) => entry.stationary_name !== item.stationary_name), item].sort((a, b) => a.stationary_name.localeCompare(b.stationary_name));
  saveLocal(STORAGE_KEYS.stationary, next);
}

export async function deleteStationaryRule(name: string) {
  if (supabase) {
    const { error } = await supabase.from('stationary_rule_master').delete().eq('stationary_name', name);
    if (error) throw error;
    return;
  }
  const seed = mapSeedStationary();
  const items = loadLocal(STORAGE_KEYS.stationary, seed).filter((item) => item.stationary_name !== name);
  saveLocal(STORAGE_KEYS.stationary, items);
}

export async function listGpClassifications(): Promise<GpClassification[]> {
  const seed = mapSeedGpClassification();
  if (supabase) {
    const { data, error } = await supabase.from('gp_classification_master').select('*').order('attribute_type');
    if (!error && Array.isArray(data)) {
      return data as GpClassification[];
    }
  }
  return loadLocal(STORAGE_KEYS.gp, seed);
}

export async function upsertGpClassification(item: GpClassification) {
  if (supabase) {
    const { error } = await supabase.from('gp_classification_master').upsert(item);
    if (error) throw error;
    return;
  }
  const seed = mapSeedGpClassification();
  const items = loadLocal(STORAGE_KEYS.gp, seed);
  const next = [...items.filter((entry) => entry.attribute_type !== item.attribute_type), item];
  saveLocal(STORAGE_KEYS.gp, next);
}

export async function deleteGpClassification(attributeType: string) {
  if (supabase) {
    const { error } = await supabase.from('gp_classification_master').delete().eq('attribute_type', attributeType);
    if (error) throw error;
    return;
  }
  const seed = mapSeedGpClassification();
  const items = loadLocal(STORAGE_KEYS.gp, seed).filter((item) => item.attribute_type !== attributeType);
  saveLocal(STORAGE_KEYS.gp, items);
}

export async function listConstructionMasters(): Promise<ConstructionMaster[]> {
  const seed = mapSeedConstruction();
  if (supabase) {
    const { data, error } = await supabase.from('construction_master').select('*').order('construction_type');
    if (!error && Array.isArray(data)) {
      return data as ConstructionMaster[];
    }
  }
  return loadLocal(STORAGE_KEYS.construction, seed);
}

export async function upsertConstructionMaster(item: ConstructionMaster) {
  if (supabase) {
    const { error } = await supabase.from('construction_master').upsert(item);
    if (error) throw error;
    return;
  }
  const seed = mapSeedConstruction();
  const items = loadLocal(STORAGE_KEYS.construction, seed);
  const next = [...items.filter((entry) => entry.construction_type !== item.construction_type), item];
  saveLocal(STORAGE_KEYS.construction, next);
}

export async function deleteConstructionMaster(type: string) {
  if (supabase) {
    const { error } = await supabase.from('construction_master').delete().eq('construction_type', type);
    if (error) throw error;
    return;
  }
  const seed = mapSeedConstruction();
  const items = loadLocal(STORAGE_KEYS.construction, seed).filter((item) => item.construction_type !== type);
  saveLocal(STORAGE_KEYS.construction, items);
}

export async function listBomItems(): Promise<BomMasterItem[]> {
  const seed = mapSeedBom();
  if (supabase) {
    const { data, error } = await supabase.from('bom_master').select('*').order('product_type').order('item_no');
    if (!error && Array.isArray(data)) {
      return data as BomMasterItem[];
    }
  }
  return loadLocal(STORAGE_KEYS.bom, seed);
}

export async function listConfigurations(): Promise<SealConfigurationTxn[]> {
  if (supabase) {
    const { data, error } = await supabase.from('seal_configuration_txn').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      return data as SealConfigurationTxn[];
    }
  }
  return loadLocal(STORAGE_KEYS.configurations, [] as SealConfigurationTxn[]).sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );
}

export async function createConfiguration(item: SealConfigurationTxn) {
  if (supabase) {
    const { error } = await supabase.from('seal_configuration_txn').insert(item);
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.configurations, [] as SealConfigurationTxn[]);
  const next: SealConfigurationTxn[] = [
    {
      ...item,
      id: item.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
    },
    ...items,
  ];
  saveLocal(STORAGE_KEYS.configurations, next);
}

export async function deleteConfiguration(id: string) {
  if (supabase) {
    const { error } = await supabase.from('seal_configuration_txn').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const items = loadLocal(STORAGE_KEYS.configurations, [] as SealConfigurationTxn[]).filter((item) => item.id !== id);
  saveLocal(STORAGE_KEYS.configurations, items);
}
