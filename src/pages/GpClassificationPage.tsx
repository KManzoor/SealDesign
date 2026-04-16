import { useEffect, useState } from 'react';
import MasterCrudTable from '../components/MasterCrudTable';
import { deleteGpClassification, listGpClassifications, upsertGpClassification } from '../services/masterDataService';
import type { GpClassification } from '../types';

const initialForm = { attribute_type: '', output_pattern: '', notes: '' };

export default function GpClassificationPage() {
  const [items, setItems] = useState<GpClassification[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState('');

  async function load() {
    setItems(await listGpClassifications());
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit() {
    if (!formData.attribute_type.trim()) return;
    await upsertGpClassification({
      attribute_type: formData.attribute_type.trim(),
      output_pattern: formData.output_pattern.trim(),
      notes: formData.notes.trim(),
    });
    setMessage('GP classification saved successfully.');
    setFormData(initialForm);
    await load();
  }

  async function handleDelete(item: GpClassification) {
    await deleteGpClassification(item.attribute_type);
    setMessage('GP classification deleted successfully.');
    await load();
  }

  return (
    <>
      {message ? <div className="banner info">{message}</div> : null}
      <MasterCrudTable
        title="GP Classification Master"
        description="Maintain the output patterns used to decide the final attribute format."
        fields={[
          { name: 'attribute_type', label: 'Attribute Type' },
          { name: 'output_pattern', label: 'Output Pattern' },
          { name: 'notes', label: 'Notes' },
        ]}
        formData={formData}
        setFormData={setFormData}
        items={items}
        columns={[
          { key: 'attribute_type', label: 'Attribute Type' },
          { key: 'output_pattern', label: 'Output Pattern' },
          { key: 'notes', label: 'Notes' },
        ]}
        onSubmit={handleSubmit}
        onEdit={(item) => setFormData({ ...item })}
        onDelete={handleDelete}
      />
    </>
  );
}
