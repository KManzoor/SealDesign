import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deleteStationaryRule, listStationaryRules, upsertStationaryRule } from '../services/masterDataService';
import type { StationaryMasterRow } from '../types';

const initialForm = {
  stationary_name: '',
  default_api_plan: '0',
  gland_code_0: 'G1',
  gland_code_11: 'G11',
  gland_code_1162: 'G116',
  gland_code_52: 'G52',
  gland_code_53: 'G53',
  gland_code_54: 'G54',
};

export default function StationaryMasterPage() {
  const [items, setItems] = useState<StationaryMasterRow[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await listStationaryRules();
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    if (!formData.stationary_name.trim()) return;
    await upsertStationaryRule({
      stationary_name: formData.stationary_name.trim(),
      default_api_plan: formData.default_api_plan,
      gland_code_0: formData.gland_code_0,
      gland_code_11: formData.gland_code_11,
      gland_code_1162: formData.gland_code_1162,
      gland_code_52: formData.gland_code_52,
      gland_code_53: formData.gland_code_53,
      gland_code_54: formData.gland_code_54,
    });
    setMessage('Stationary rule saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: StationaryMasterRow) {
    await deleteStationaryRule(item.stationary_name);
    setMessage('Stationary rule deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="Stationary Rule Master"
        description="Maintain the default API plan and gland code mapping used by the final generator."
        fields={[
          { name: 'stationary_name', label: 'Stationary Name' },
          { name: 'default_api_plan', label: 'Default API Plan', type: 'select', options: ['0', '11', '11/62', '52', '53', '54'] },
          { name: 'gland_code_0', label: 'Code for 0' },
          { name: 'gland_code_11', label: 'Code for 11' },
          { name: 'gland_code_1162', label: 'Code for 11/62' },
          { name: 'gland_code_52', label: 'Code for 52' },
          { name: 'gland_code_53', label: 'Code for 53' },
          { name: 'gland_code_54', label: 'Code for 54' },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'stationary_name', label: 'Stationary' },
          { key: 'default_api_plan', label: 'Default API Plan' },
          { key: 'gland_code_0', label: '0' },
          { key: 'gland_code_11', label: '11' },
          { key: 'gland_code_1162', label: '11/62' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ ...item })}
        onDelete={handleDelete}
      />
    </>
  );
}
