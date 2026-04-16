import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deleteSealType, listSealTypes, upsertSealType } from '../services/masterDataService';
import type { SealType } from '../types';

const initialForm = { code: '', description: '', balanceType: 'Balance' };

export default function SealTypeMasterPage() {
  const [items, setItems] = useState<SealType[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await listSealTypes();
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    setError('');
    setMessage('');
    if (!formData.code.trim() || !formData.description.trim() || !formData.balanceType.trim()) {
      setError('Seal Type Code, Description, and Balance Type are required.');
      return;
    }
    await upsertSealType({ code: formData.code.trim(), description: formData.description.trim(), balanceType: formData.balanceType || 'Balance' });
    setMessage('Seal type saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: SealType) {
    await deleteSealType(item.code);
    setMessage('Seal type deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="Seal Type Master"
        description="Create, update, and delete real seal type records used by the prototype generator."
        successMessage={message}
        errorMessage={error}
        fields={[
          { name: 'code', label: 'Seal Type Code' },
          { name: 'description', label: 'Description' },
          { name: 'balanceType', label: 'Balance Type', type: 'select', options: ['Balance', 'Unbalance'] },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
          { key: 'balanceType', label: 'Balance Type' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ code: item.code, description: item.description, balanceType: item.balanceType })}
        onDelete={handleDelete}
      />
    </>
  );
}
