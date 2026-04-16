import { Link } from 'react-router-dom';

const cards = [
  { title: 'Seal Type Master', path: '/masters/seal-types', desc: 'Manage seal type definitions' },
  { title: 'MOC Master', path: '/masters/moc', desc: 'Maintain material of construction codes' },
  { title: 'Pump Model Master', path: '/masters/pumps', desc: 'Map pump make and model to generated pump codes' },
  { title: 'Stationary Rule Master', path: '/masters/stationary', desc: 'Define API plan and gland code logic' },
  { title: 'Saved Configurations', path: '/configurations', desc: 'Review and delete saved outputs' },
];

export default function MasterHomePage() {
  return (
    <div className="page-card">
      <h2>Master Pages</h2>
      <p className="muted">These admin pages now load data automatically and support CRUD operations.</p>
      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="summary-card">
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p className="muted">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
