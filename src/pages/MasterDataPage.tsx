import { mocOptions, pumpOptions, sealTypes } from '../data/seedData';

export default function MasterDataPage() {
  return (
    <div className="page-card">
      <h2>Master Data</h2>
      <p className="muted">Admin users can review the seeded configuration used by the prototype.</p>

      <div className="summary-grid" style={{ marginBottom: '16px' }}>
        <div className="summary-card"><strong>{sealTypes.length}</strong><br />Seal types</div>
        <div className="summary-card"><strong>{mocOptions.length}</strong><br />MOC options</div>
        <div className="summary-card"><strong>{pumpOptions.length}</strong><br />Pump mappings</div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Seal Type</th>
              <th>Description</th>
              <th>Balance Type</th>
            </tr>
          </thead>
          <tbody>
            {sealTypes.map((item) => (
              <tr key={item.code}>
                <td>{item.code}</td>
                <td>{item.description}</td>
                <td>{item.balanceType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
