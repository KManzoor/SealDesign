import type { ReactNode } from 'react';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select';
  options?: string[];
}

interface MasterCrudTableProps<T> {
  title: string;
  description: string;
  fields: FieldConfig[];
  formData: Record<string, string>;
  setFormData: (value: Record<string, string>) => void;
  items: T[];
  columns: Array<{ key: string; label: string; render?: (item: T) => ReactNode }>;
  onSubmit: () => Promise<void> | void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => Promise<void> | void;
  resetLabel?: string;
  submitLabel?: string;
}

export default function MasterCrudTable<T>({
  title,
  description,
  fields,
  formData,
  setFormData,
  items,
  columns,
  onSubmit,
  onEdit,
  onDelete,
  resetLabel = 'Clear',
  submitLabel = 'Save',
}: MasterCrudTableProps<T>) {
  return (
    <div className="page-card">
      <h2>{title}</h2>
      <p className="muted">{description}</p>

      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-grid">
          {fields.map((field) => (
            <div className="field" key={field.name}>
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                >
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button className="primary-btn" onClick={() => void onSubmit()}>{submitLabel}</button>
          <button className="secondary-btn" onClick={() => setFormData(Object.fromEntries(fields.map((field) => [field.name, ''])))}>{resetLabel}</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(item) : String((item as any)[column.key] ?? '')}</td>
                ))}
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="secondary-btn" onClick={() => onEdit(item)}>Edit</button>
                    <button className="primary-btn" onClick={() => void onDelete(item)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>No records found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
