import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deleteConstructionMaster, listConstructionMasters, upsertConstructionMaster } from '../services/masterDataService';
import type { ConstructionMaster } from '../types';

const initialForm = { construction_type: '', suffix_code: '', api_plan: '0', api_code: 'G1', remarks: '' };

export default function ConstructionMasterPage() {
  const [items, setItems] = useState<ConstructionMaster[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');

  async function load() {
    setItems(await listConstructionMasters());
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    if (!formData.construction_type.trim()) return;
    await upsertConstructionMaster({
      construction_type: formData.construction_type.trim(),
      suffix_code: formData.suffix_code.trim(),
      api_plan: formData.api_plan,
      api_code: formData.api_code.trim(),
      remarks: formData.remarks.trim(),
    });
    setMessage('Construction rule saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: ConstructionMaster) {
    await deleteConstructionMaster(item.construction_type);
    setMessage('Construction rule deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="Construction Master"
        description="Manage cartridge and non-cartridge rules along with their API codes."
        successMessage={message}
        fields={[
          { name: 'construction_type', label: 'Construction Type' },
          { name: 'suffix_code', label: 'Suffix Code' },
          { name: 'api_plan', label: 'API Plan', type: 'select', options: ['0', '11', '11/62', '52', '53', '54'] },
          { name: 'api_code', label: 'API Code' },
          { name: 'remarks', label: 'Remarks' },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'construction_type', label: 'Construction' },
          { key: 'suffix_code', label: 'Suffix' },
          { key: 'api_plan', label: 'API Plan' },
          { key: 'api_code', label: 'API Code' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ ...item })}
        onDelete={handleDelete}
      />
    </>
  );
}
