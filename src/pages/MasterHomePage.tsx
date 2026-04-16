import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listConstructionMasters, listGpClassifications, listMocOptions, listPumpOptions, listSealTypes, listStationaryRules } from '../services/masterDataService';

export default function MasterHomePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const [sealTypes, mocs, pumps, stationary, gp, construction] = await Promise.all([
        listSealTypes(),
        listMocOptions(),
        listPumpOptions(),
        listStationaryRules(),
        listGpClassifications(),
        listConstructionMasters(),
      ]);

      setCounts({
        '/masters/gp': gp.length,
        '/masters/construction': construction.length,
        '/masters/seal-types': sealTypes.length,
        '/masters/moc': mocs.length,
        '/masters/pumps': pumps.length,
        '/masters/stationary': stationary.length,
      });
    }

    void load();
  }, []);

  const cards = [
    { title: 'GP Classification Master', path: '/masters/gp', desc: 'Maintain output pattern rules' },
    { title: 'Construction Master', path: '/masters/construction', desc: 'Manage cartridge and non-cartridge rules' },
    { title: 'Seal Type Master', path: '/masters/seal-types', desc: 'Manage seal type definitions' },
    { title: 'MOC Master', path: '/masters/moc', desc: 'Maintain material of construction codes' },
    { title: 'Pump Model Master', path: '/masters/pumps', desc: 'Map pump make and model to generated pump codes' },
    { title: 'Stationary Rule Master', path: '/masters/stationary', desc: 'Define API plan and gland code logic' },
  ];

  return (
    <div className="page-card">
      <h2>Master Pages</h2>
      <p className="muted">These screens now read their values dynamically from the configured database.</p>
      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="summary-card">
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p className="muted">{card.desc}</p>
            <strong>{counts[card.path] || 0} records</strong>
          </Link>
        ))}
      </div>
    </div>
  );
}
