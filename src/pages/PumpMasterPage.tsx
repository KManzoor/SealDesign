import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deletePumpOption, listPumpOptions, upsertPumpOption } from '../services/masterDataService';
import type { PumpOption } from '../types';

const initialForm = { make: '', model: '', pumpCode: '' };

export default function PumpMasterPage() {
  const [items, setItems] = useState<PumpOption[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await listPumpOptions();
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    if (!formData.make.trim() || !formData.model.trim()) return;
    await upsertPumpOption({ make: formData.make.trim(), model: formData.model.trim(), pumpCode: formData.pumpCode.trim() });
    setMessage('Pump mapping saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: PumpOption) {
    await deletePumpOption(item.make, item.model);
    setMessage('Pump mapping deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="Pump Model Master"
        description="Manage pump make, pump model, and generated pump model codes."
        fields={[
          { name: 'make', label: 'Pump Make' },
          { name: 'model', label: 'Pump Model' },
          { name: 'pumpCode', label: 'Pump Model Code' },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'make', label: 'Pump Make' },
          { key: 'model', label: 'Pump Model' },
          { key: 'pumpCode', label: 'Pump Code' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ make: item.make, model: item.model, pumpCode: item.pumpCode })}
        onDelete={handleDelete}
      />
    </>
  );
}
