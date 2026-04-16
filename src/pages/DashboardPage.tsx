export default function DashboardPage() {
  return (
    <div className="card-grid">
      <div className="summary-card">
        <h3>Admin Overview</h3>
        <p className="muted">Full access to masters, guide, and the prototype generator.</p>
      </div>
      <div className="summary-card">
        <h3>Authentication</h3>
        <p className="muted">Supabase-integrated login using the shared app_users logic and SHA-256 password validation.</p>
      </div>
      <div className="summary-card">
        <h3>Access Control</h3>
        <p className="muted">Menu visibility is filtered dynamically using role data and optional user access mapping.</p>
      </div>
      <div className="summary-card">
        <h3>Seeded Data</h3>
        <p className="muted">Seal types, MOC mappings, pumps, and stationary rules are preloaded from the guide.</p>
      </div>
    </div>
  );
}
