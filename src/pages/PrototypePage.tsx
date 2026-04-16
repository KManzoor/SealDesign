import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createConfiguration, listBomItems, listConstructionMasters, listGpClassifications, listMocOptions, listPumpOptions, listSealTypes, listStationaryRules } from '../services/masterDataService';
import type { BomMasterItem, ConstructionMaster, GpClassification, MocOption, PumpOption, SealType, StationaryMasterRow } from '../types';

function toStationaryMap(items: StationaryMasterRow[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.stationary_name,
      {
        apiPlan: item.default_api_plan,
        glandCodes: {
          '0': item.gland_code_0,
          '11': item.gland_code_11,
          '11/62': item.gland_code_1162,
          '52': item.gland_code_52,
          '53': item.gland_code_53,
          '54': item.gland_code_54,
        },
      },
    ])
  ) as Record<string, { apiPlan: string; glandCodes: Record<string, string> }>;
}

export default function PrototypePage() {
  const { user } = useAuth();
  const [gpClassifications, setGpClassifications] = useState<GpClassification[]>([]);
  const [constructionOptions, setConstructionOptions] = useState<ConstructionMaster[]>([]);
  const [bomItems, setBomItems] = useState<BomMasterItem[]>([]);
  const [sealTypes, setSealTypes] = useState<SealType[]>([]);
  const [mocOptions, setMocOptions] = useState<MocOption[]>([]);
  const [pumpOptions, setPumpOptions] = useState<PumpOption[]>([]);
  const [stationaryRows, setStationaryRows] = useState<StationaryMasterRow[]>([]);
  const [attributeType, setAttributeType] = useState('');
  const [sealType, setSealType] = useState('');
  const [sealSize, setSealSize] = useState('50');
  const [construction, setConstruction] = useState('');
  const [stationary, setStationary] = useState('');
  const [apiPlan, setApiPlan] = useState('11/62');
  const [pumpMake, setPumpMake] = useState('');
  const [pumpModel, setPumpModel] = useState('');
  const [mocCode, setMocCode] = useState('');
  const [resultCode, setResultCode] = useState('');
  const [usedValues, setUsedValues] = useState('');
  const [bom, setBom] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const pumpMakes = useMemo(() => [...new Set(pumpOptions.map((item) => item.make))], [pumpOptions]);
  const stationaries = useMemo(() => toStationaryMap(stationaryRows), [stationaryRows]);
  const models = useMemo(() => pumpOptions.filter((item) => item.make === pumpMake), [pumpOptions, pumpMake]);
  const apiPlanOptions = useMemo(() => {
    const fromConstruction = constructionOptions.map((item) => item.api_plan);
    const fromStationary = stationaryRows.flatMap(() => ['0', '11', '11/62', '52', '53', '54']);
    return [...new Set([...fromConstruction, ...fromStationary])];
  }, [constructionOptions, stationaryRows]);

  useEffect(() => {
    async function load() {
      const [gpRows, constructionRows, bomRows, sealTypeRows, mocRows, pumpRows, stationaryRuleRows] = await Promise.all([
        listGpClassifications(),
        listConstructionMasters(),
        listBomItems(),
        listSealTypes(),
        listMocOptions(),
        listPumpOptions(),
        listStationaryRules(),
      ]);

      setGpClassifications(gpRows);
      setConstructionOptions(constructionRows);
      setBomItems(bomRows);
      setSealTypes(sealTypeRows);
      setMocOptions(mocRows);
      setPumpOptions(pumpRows);
      setStationaryRows(stationaryRuleRows);
      setAttributeType(gpRows[0]?.attribute_type || 'COMPLETE SEAL');
      setConstruction(constructionRows[0]?.construction_type || 'Non Cartridge');
      setSealType(sealTypeRows[0]?.code || '');
      setMocCode(mocRows[0]?.code || '');
      setPumpMake(pumpRows[0]?.make || '');
      setPumpModel(pumpRows[0]?.model || '');
      setStationary(stationaryRuleRows[0]?.stationary_name || '');
    }

    void load();
  }, []);

  useEffect(() => {
    const defaultModel = models[0]?.model || '';
    if (!models.some((item) => item.model === pumpModel)) {
      setPumpModel(defaultModel);
    }
  }, [models, pumpModel]);

  useEffect(() => {
    const defaultPlan = stationaries[stationary]?.apiPlan;
    if (defaultPlan) {
      setApiPlan(defaultPlan);
    }
  }, [stationary, stationaries]);

  const liveApiCodes = Object.fromEntries(constructionOptions.map((item) => [item.api_plan, item.api_code]));
  const glandTypeCode = stationaries[stationary]?.glandCodes[apiPlan] || liveApiCodes[apiPlan] || 'G1';
  const pumpCode = pumpOptions.find((item) => item.make === pumpMake && item.model === pumpModel)?.pumpCode || '';

  useEffect(() => {
    let nextCode = '';

    if (attributeType === 'COMPLETE SEAL') {
      nextCode = `39-${sealType}/${sealSize}-${glandTypeCode}${pumpCode}${mocCode}`;
    } else if (attributeType === 'COMPLETE SEAL WITHOUT GLAND PLATE') {
      nextCode = `39-${sealType}/${sealSize}-${pumpCode}${mocCode}`;
    } else {
      nextCode = `39-${sealType}/${sealSize}-${stationary}${mocCode}`;
    }

    let nextBom = bomItems
      .filter((item) => item.product_type.toUpperCase() === attributeType.toUpperCase())
      .sort((a, b) => a.item_no.localeCompare(b.item_no))
      .map((item) => item.component_name);

    if (nextBom.length === 0) {
      nextBom = ['Rotary Assembly', 'Stationary', 'O-Ring'];
    }

    if (construction === 'Cartridge') {
      nextBom = [...nextBom, 'Driver', 'Screws', 'Fixtures'];
    }

    setResultCode(nextCode);
    setBom(nextBom);
    setUsedValues(
      `Stationary: ${stationary} | API Plan: ${apiPlan} | Gland Type Code: ${glandTypeCode} | Pump: ${pumpMake} / ${pumpModel} | Pump Model Code: ${pumpCode} | MOC: ${mocCode}`
    );
  }, [attributeType, sealType, sealSize, construction, stationary, apiPlan, pumpMake, pumpModel, mocCode, glandTypeCode, pumpCode, bomItems]);

  async function handleSave() {
    setError('');
    setMessage('');
    if (!attributeType || !sealType || !sealSize.trim() || !construction || !stationary || !apiPlan || !pumpMake || !pumpModel || !pumpCode || !mocCode || !resultCode) {
      setError('Please fill all required fields used for final code generation before saving.');
      return;
    }
    const configurationNo = `CFG-${Date.now()}`;
    await createConfiguration({
      id: crypto.randomUUID(),
      configuration_no: configurationNo,
      attribute_type: attributeType,
      seal_type: sealType,
      seal_size: sealSize,
      construction_type: construction,
      stationary_name: stationary,
      api_plan: apiPlan,
      pump_make: pumpMake,
      pump_model: pumpModel,
      pump_code: pumpCode,
      moc_code: mocCode,
      generated_attribute: resultCode,
      created_by: user?.username || '',
      created_at: new Date().toISOString(),
    });
    setMessage(`Configuration ${configurationNo} saved successfully.`);
  }

  return (
    <div className="page-card">
      <h2>Last Screen Prototype</h2>
      <p className="muted">This page now loads its master values dynamically and can save generated configurations.</p>
      {message ? <div className="banner info">{message}</div> : null}
      {error ? <div className="banner error">{error}</div> : null}

      <div className="form-card">
        <div className="form-grid">
          <div className="field">
            <label>Attribute Type</label>
            <select value={attributeType} onChange={(e) => setAttributeType(e.target.value)}>
              {gpClassifications.map((item) => <option key={item.attribute_type}>{item.attribute_type}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Seal Type</label>
            <select value={sealType} onChange={(e) => setSealType(e.target.value)}>
              {sealTypes.map((item) => <option key={item.code}>{item.code}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Seal Size</label>
            <input value={sealSize} onChange={(e) => setSealSize(e.target.value)} />
          </div>
          <div className="field">
            <label>Construction</label>
            <select value={construction} onChange={(e) => setConstruction(e.target.value)}>
              {constructionOptions.map((item) => <option key={item.construction_type}>{item.construction_type}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Stationary</label>
            <select value={stationary} onChange={(e) => setStationary(e.target.value)}>
              {stationaryRows.map((item) => <option key={item.stationary_name}>{item.stationary_name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>API Plan</label>
            <select value={apiPlan} onChange={(e) => setApiPlan(e.target.value)}>
              {apiPlanOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Gland Type Code</label>
            <input value={glandTypeCode} readOnly />
          </div>
          <div className="field">
            <label>Pump Make</label>
            <select value={pumpMake} onChange={(e) => setPumpMake(e.target.value)}>
              {pumpMakes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Pump Model</label>
            <select value={pumpModel} onChange={(e) => setPumpModel(e.target.value)}>
              {models.map((item) => <option key={item.model}>{item.model}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Pump Model Code</label>
            <input value={pumpCode} readOnly />
          </div>
          <div className="field">
            <label>MOC Code</label>
            <select value={mocCode} onChange={(e) => setMocCode(e.target.value)}>
              {mocOptions.map((item) => <option key={item.code} value={item.code}>{item.code} - {item.desc}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button className="primary-btn" onClick={() => void handleSave()}>Save Configuration</button>
          <button className="secondary-btn" onClick={() => setMessage('')}>Clear Message</button>
        </div>

        <div className="result-box">
          <div>Generated Attribute</div>
          <div className="big">{resultCode}</div>
          <div style={{ marginTop: '12px' }}>Master Values Used</div>
          <div>{usedValues}</div>
          <div style={{ marginTop: '12px' }}>Derived BOM</div>
          <div>{bom.join(' | ')}</div>
        </div>
      </div>
    </div>
  );
}
