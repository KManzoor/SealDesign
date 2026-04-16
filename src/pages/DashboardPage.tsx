import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { listConfigurations, listConstructionMasters, listGpClassifications, listMocOptions, listPumpOptions, listSealTypes, listStationaryRules } from '../services/masterDataService';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ sealTypes: 0, mocs: 0, pumps: 0, stationary: 0, gp: 0, construction: 0, configurations: 0 });

  useEffect(() => {
    async function load() {
      const [sealTypes, mocs, pumps, stationary, gp, construction, configurations] = await Promise.all([
        listSealTypes(),
        listMocOptions(),
        listPumpOptions(),
        listStationaryRules(),
        listGpClassifications(),
        listConstructionMasters(),
        listConfigurations(),
      ]);

      setCounts({
        sealTypes: sealTypes.length,
        mocs: mocs.length,
        pumps: pumps.length,
        stationary: stationary.length,
        gp: gp.length,
        construction: construction.length,
        configurations: configurations.length,
      });
    }

    void load();
  }, []);

  return (
    <div>
      <div className="banner info">
        Data source status: {isSupabaseConfigured ? 'Supabase connected' : 'Local fallback mode'}
      </div>
      <div className="card-grid">
        <div className="summary-card"><h3>Seal Types</h3><p className="muted">{counts.sealTypes} records loaded</p></div>
        <div className="summary-card"><h3>MOC Master</h3><p className="muted">{counts.mocs} records loaded</p></div>
        <div className="summary-card"><h3>Pump Models</h3><p className="muted">{counts.pumps} records loaded</p></div>
        <div className="summary-card"><h3>Stationary Rules</h3><p className="muted">{counts.stationary} records loaded</p></div>
        <div className="summary-card"><h3>GP Classifications</h3><p className="muted">{counts.gp} records loaded</p></div>
        <div className="summary-card"><h3>Construction Rules</h3><p className="muted">{counts.construction} records loaded</p></div>
        <div className="summary-card"><h3>Saved Configurations</h3><p className="muted">{counts.configurations} records loaded</p></div>
      </div>
    </div>
  );
}
