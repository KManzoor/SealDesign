export default function UserGuidePage() {
  return (
    <div className="page-card">
      <h2>User Guide Summary</h2>
      <p className="muted">This screen converts the workbook logic into clear application rules.</p>

      <div className="banner info">
        Complete Seal = 39 - Seal Type / Seal Size - Gland Type Code + Pump Model Code + MOC Code
      </div>

      <ul>
        <li>Admin users can access all screens and configurations.</li>
        <li>Normal users are restricted to the Last Screen Prototype only.</li>
        <li>API plan and gland type are auto-derived from the stationary selection.</li>
        <li>Pump model code is auto-derived from the selected make and model.</li>
        <li>MOC codes and seal types are seeded using the workbook guide.</li>
      </ul>
    </div>
  );
}
