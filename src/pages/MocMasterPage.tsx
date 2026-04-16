import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deleteMocOption, listMocOptions, upsertMocOption } from '../services/masterDataService';
import type { MocOption } from '../types';

const initialForm = { code: '', desc: '' };

export default function MocMasterPage() {
  const [items, setItems] = useState<MocOption[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await listMocOptions();
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    setError('');
    setMessage('');
    if (!formData.code.trim() || !formData.desc.trim()) {
      setError('MOC Code and Description are required.');
      return;
    }
    await upsertMocOption({ code: formData.code.trim(), desc: formData.desc.trim() });
    setMessage('MOC saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: MocOption) {
    await deleteMocOption(item.code);
    setMessage('MOC deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="MOC Master"
        description="Maintain the MOC options that are used during attribute generation."
        successMessage={message}
        errorMessage={error}
        fields={[
          { name: 'code', label: 'MOC Code' },
          { name: 'desc', label: 'Description' },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'desc', label: 'Description' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ code: item.code, desc: item.desc })}
        onDelete={handleDelete}
      />
    </>
  );
}
