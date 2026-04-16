import { useEffect, useState } from 'react';
import { listConstructionMasters, listGpClassifications } from '../services/masterDataService';
import type { ConstructionMaster, GpClassification } from '../types';

export default function UserGuidePage() {
  const [gpRows, setGpRows] = useState<GpClassification[]>([]);
  const [constructionRows, setConstructionRows] = useState<ConstructionMaster[]>([]);

  useEffect(() => {
    async function load() {
      const [gp, construction] = await Promise.all([
        listGpClassifications(),
        listConstructionMasters(),
      ]);
      setGpRows(gp);
      setConstructionRows(construction);
    }

    void load();
  }, []);

  return (
    <div className="page-card">
      <h2>User Guide Summary</h2>
      <p className="muted">This summary is now generated from the database-backed master tables.</p>

      <div className="banner info">
        Complete Seal = 39 - Seal Type / Seal Size - Gland Type Code + Pump Model Code + MOC Code
      </div>

      <h3>GP Classification Rules</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Attribute Type</th>
              <th>Output Pattern</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {gpRows.map((item) => (
              <tr key={item.attribute_type}>
                <td>{item.attribute_type}</td>
                <td>{item.output_pattern}</td>
                <td>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '16px' }}>Construction Rules</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Construction Type</th>
              <th>Suffix</th>
              <th>API Plan</th>
              <th>API Code</th>
            </tr>
          </thead>
          <tbody>
            {constructionRows.map((item) => (
              <tr key={item.construction_type}>
                <td>{item.construction_type}</td>
                <td>{item.suffix_code || '-'}</td>
                <td>{item.api_plan}</td>
                <td>{item.api_code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
