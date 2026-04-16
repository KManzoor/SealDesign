import { useEffect, useState } from 'react';
import { deleteConfiguration, listConfigurations } from '../services/masterDataService';
import type { SealConfigurationTxn } from '../types';

export default function ConfigurationsPage() {
  const [items, setItems] = useState<SealConfigurationTxn[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await listConfigurations();
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: string) {
    await deleteConfiguration(id);
    setMessage('Configuration deleted successfully.');
    await load();
  }

  return (
    <div className="page-card">
      <h2>Saved Configurations</h2>
      <p className="muted">All generated seal configurations are listed here with live storage support.</p>
      {message ? <div className="banner info">{message}</div> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Configuration No</th>
              <th>Attribute Type</th>
              <th>Generated Attribute</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.configuration_no}</td>
                <td>{item.attribute_type}</td>
                <td>{item.generated_attribute}</td>
                <td>{item.created_by || '-'}</td>
                <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
                <td><button className="primary-btn" onClick={() => void handleDelete(item.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>No saved configurations yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
