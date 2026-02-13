import { FormEvent, useMemo, useState } from 'react';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useOrchards } from '../hooks/useOrchards';
import { useSprayPrograms } from '../hooks/useSprayPrograms';
import { Droplets, Plus, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';

const recommendedChemicals = [
  {
    name: 'SKAUST Template - Insecticide A',
    active_ingredient: 'Active A',
    target_pest: 'Aphids, Leaf roller',
    crop: 'Apple',
    dose_min: 200,
    dose_max: 300,
    dose_unit: 'ml/kanal',
    phi_days: 14,
    rei_hours: 24,
    notes: 'Template. Update with your local recommendation.'
  },
  {
    name: 'SKAUST Template - Fungicide B',
    active_ingredient: 'Active B',
    target_pest: 'Scab, Powdery mildew',
    crop: 'Apple',
    dose_min: 300,
    dose_max: 400,
    dose_unit: 'g/kanal',
    phi_days: 10,
    rei_hours: 12,
    notes: 'Template. Update with your local recommendation.'
  },
  {
    name: 'SKAUST Template - Nutrient C',
    active_ingredient: 'Active C',
    target_pest: 'Nutrition',
    crop: 'Apple',
    dose_min: 250,
    dose_max: 350,
    dose_unit: 'ml/kanal',
    phi_days: 0,
    rei_hours: 4,
    notes: 'Template. Update with your local recommendation.'
  }
];

const recommendedPrograms = [
  {
    name: 'SKAUST Template - Early Season',
    crop: 'Apple',
    stage: 'Dormant to Green Tip',
    items: [
      { chemicalName: 'SKAUST Template - Fungicide B', interval_days: 10, dose_rate: 350, dose_unit: 'g/kanal' },
      { chemicalName: 'SKAUST Template - Insecticide A', interval_days: 14, dose_rate: 250, dose_unit: 'ml/kanal' }
    ]
  }
];

export function SprayManagement() {
  const { fields } = useFields();
  const { trees } = useTrees();
  const { orchards } = useOrchards();
  const {
    chemicals,
    programs,
    programItems,
    logs,
    loading,
    error,
    addChemical,
    addProgram,
    addProgramItem,
    addLog
  } = useSprayPrograms();

  const [activeTab, setActiveTab] = useState<'chemicals' | 'programs' | 'logs'>('logs');
  const [showChemicalForm, setShowChemicalForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [chemicalForm, setChemicalForm] = useState({
    name: '',
    activeIngredient: '',
    targetPest: '',
    crop: 'Apple',
    doseMin: '',
    doseMax: '',
    doseUnit: 'ml/kanal',
    phiDays: '0',
    reiHours: '0',
    notes: ''
  });

  const [programForm, setProgramForm] = useState({
    name: '',
    crop: 'Apple',
    stage: '',
    notes: ''
  });

  const [programItemForm, setProgramItemForm] = useState({
    programId: '',
    chemicalId: '',
    intervalDays: '',
    doseRate: '',
    doseUnit: 'ml/kanal',
    sortOrder: '0',
    notes: ''
  });

  const [logForm, setLogForm] = useState({
    fieldId: '',
    orchardId: '',
    treeBlockId: '',
    programId: '',
    chemicalId: '',
    appliedAt: '',
    doseRate: '',
    doseUnit: 'ml/kanal',
    areaKanal: '',
    mixVolume: '',
    targetIssue: '',
    notes: ''
  });

  const chemicalsById = useMemo(() => {
    return chemicals.reduce<Record<string, typeof chemicals[number]>>((acc, chemical) => {
      acc[chemical.id] = chemical;
      return acc;
    }, {});
  }, [chemicals]);

  const programItemsByProgram = useMemo(() => {
    return programItems.reduce<Record<string, typeof programItems>>((acc, item) => {
      if (!acc[item.program_id]) acc[item.program_id] = [];
      acc[item.program_id].push(item);
      return acc;
    }, {} as Record<string, typeof programItems>);
  }, [programItems]);

  const handleLoadRecommended = async () => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      const existingNames = new Set(chemicals.map(c => c.name.toLowerCase()));
      for (const chem of recommendedChemicals) {
        if (!existingNames.has(chem.name.toLowerCase())) {
          await addChemical({
            name: chem.name,
            active_ingredient: chem.active_ingredient,
            target_pest: chem.target_pest,
            crop: chem.crop,
            dose_min: chem.dose_min,
            dose_max: chem.dose_max,
            dose_unit: chem.dose_unit,
            phi_days: chem.phi_days,
            rei_hours: chem.rei_hours,
            notes: chem.notes
          });
        }
      }

      const updatedChemicals = chemicals.concat(
        recommendedChemicals
          .filter(chem => !existingNames.has(chem.name.toLowerCase()))
          .map(chem => ({ id: '', created_at: null, user_id: null, ...chem }))
      );

      for (const program of recommendedPrograms) {
        const newProgram = await addProgram({
          name: program.name,
          crop: program.crop,
          stage: program.stage,
          notes: 'Template program. Update as needed.'
        });

        if (newProgram.data) {
          for (const item of program.items) {
            const chemical = updatedChemicals.find(c => c.name === item.chemicalName) ||
              chemicals.find(c => c.name === item.chemicalName);
            if (chemical?.id) {
              await addProgramItem({
                program_id: newProgram.data.id,
                chemical_id: chemical.id,
                interval_days: item.interval_days,
                dose_rate: item.dose_rate,
                dose_unit: item.dose_unit,
                sort_order: 0
              });
            }
          }
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to load templates.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleChemicalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!chemicalForm.name.trim()) {
      setFormError('Chemical name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addChemical({
      name: chemicalForm.name.trim(),
      active_ingredient: chemicalForm.activeIngredient.trim() || null,
      target_pest: chemicalForm.targetPest.trim() || null,
      crop: chemicalForm.crop.trim() || null,
      dose_min: chemicalForm.doseMin ? Number(chemicalForm.doseMin) : null,
      dose_max: chemicalForm.doseMax ? Number(chemicalForm.doseMax) : null,
      dose_unit: chemicalForm.doseUnit,
      phi_days: Number(chemicalForm.phiDays || 0),
      rei_hours: Number(chemicalForm.reiHours || 0),
      notes: chemicalForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setChemicalForm({
      name: '',
      activeIngredient: '',
      targetPest: '',
      crop: 'Apple',
      doseMin: '',
      doseMax: '',
      doseUnit: 'ml/kanal',
      phiDays: '0',
      reiHours: '0',
      notes: ''
    });
    setShowChemicalForm(false);
  };

  const handleProgramSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!programForm.name.trim()) {
      setFormError('Program name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addProgram({
      name: programForm.name.trim(),
      crop: programForm.crop.trim() || null,
      stage: programForm.stage.trim() || null,
      notes: programForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setProgramForm({ name: '', crop: 'Apple', stage: '', notes: '' });
    setShowProgramForm(false);
  };

  const handleProgramItemSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!programItemForm.programId || !programItemForm.chemicalId || !programItemForm.doseRate) {
      setFormError('Program, chemical, and dose rate are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addProgramItem({
      program_id: programItemForm.programId,
      chemical_id: programItemForm.chemicalId,
      interval_days: programItemForm.intervalDays ? Number(programItemForm.intervalDays) : null,
      dose_rate: Number(programItemForm.doseRate),
      dose_unit: programItemForm.doseUnit,
      sort_order: Number(programItemForm.sortOrder || 0),
      notes: programItemForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setProgramItemForm({
      programId: programItemForm.programId,
      chemicalId: '',
      intervalDays: '',
      doseRate: '',
      doseUnit: 'ml/kanal',
      sortOrder: '0',
      notes: ''
    });
  };

  const handleLogSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!logForm.chemicalId || !logForm.appliedAt || !logForm.doseRate) {
      setFormError('Chemical, application date, and dose rate are required.');
      return;
    }

    const chemical = chemicalsById[logForm.chemicalId];
    const areaKanal = Number(logForm.areaKanal || 0);
    const doseRate = Number(logForm.doseRate);
    const totalProduct = areaKanal && doseRate ? areaKanal * doseRate : 0;

    let complianceStatus: 'ok' | 'warning' = 'ok';
    let complianceNotes = '';
    if (chemical?.dose_min && doseRate < chemical.dose_min) {
      complianceStatus = 'warning';
      complianceNotes = 'Dose below recommended minimum.';
    }
    if (chemical?.dose_max && doseRate > chemical.dose_max) {
      complianceStatus = 'warning';
      complianceNotes = complianceNotes ? `${complianceNotes} Dose above recommended maximum.` : 'Dose above recommended maximum.';
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addLog({
      field_id: logForm.fieldId || null,
      orchard_id: logForm.orchardId || null,
      tree_block_id: logForm.treeBlockId || null,
      program_id: logForm.programId || null,
      chemical_id: logForm.chemicalId || null,
      applied_at: logForm.appliedAt,
      dose_rate: doseRate,
      dose_unit: logForm.doseUnit,
      area_kanal: areaKanal,
      total_product: totalProduct,
      mix_volume_liters: Number(logForm.mixVolume || 0),
      target_issue: logForm.targetIssue.trim() || null,
      phi_days: chemical?.phi_days || 0,
      rei_hours: chemical?.rei_hours || 0,
      compliance_status: complianceStatus,
      compliance_notes: complianceNotes || null,
      notes: logForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setLogForm({
      fieldId: '',
      orchardId: '',
      treeBlockId: '',
      programId: '',
      chemicalId: '',
      appliedAt: '',
      doseRate: '',
      doseUnit: 'ml/kanal',
      areaKanal: '',
      mixVolume: '',
      targetIssue: '',
      notes: ''
    });
    setShowLogForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading spray module: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="text-blue-600" />
            Spray Programs & Compliance
          </h2>
          <p className="text-sm text-gray-600 mt-1">Customize chemicals, build programs, and log compliance.</p>
        </div>
        <button
          onClick={handleLoadRecommended}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={formSubmitting}
        >
          Load SKAUST Templates
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {['logs', 'programs', 'chemicals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'logs' ? 'Spray Logs' : tab === 'programs' ? 'Spray Programs' : 'Chemicals'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Spray Logs</h3>
            <button
              onClick={() => {
                setShowLogForm(true);
                setFormError(null);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Log
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <Droplets className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600">No spray logs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {logs.map(log => {
                const chemical = log.chemical_id ? chemicalsById[log.chemical_id] : null;
                const appliedDate = new Date(log.applied_at);
                const phiEnds = log.phi_days ? new Date(appliedDate.getTime() + log.phi_days * 24 * 60 * 60 * 1000) : null;
                const reiEnds = log.rei_hours ? new Date(appliedDate.getTime() + log.rei_hours * 60 * 60 * 1000) : null;
                return (
                  <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{chemical?.name || 'Chemical'}</p>
                        <p className="text-xs text-gray-500">Applied {appliedDate.toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.compliance_status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {log.compliance_status === 'warning' ? 'Check' : 'OK'}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <div>Dosage: {log.dose_rate} {log.dose_unit}</div>
                      {log.area_kanal ? <div>Area: {log.area_kanal} kanal</div> : null}
                      {log.total_product ? <div>Total product: {log.total_product.toFixed(1)}</div> : null}
                      {log.mix_volume_liters ? <div>Mix volume: {log.mix_volume_liters} L</div> : null}
                    </div>

                    {(phiEnds || reiEnds) && (
                      <div className="mt-3 text-xs text-gray-600">
                        {phiEnds && <div className="flex items-center gap-1"><Calendar size={12} /> PHI ends {phiEnds.toLocaleDateString()}</div>}
                        {reiEnds && <div className="flex items-center gap-1"><ShieldCheck size={12} /> REI ends {reiEnds.toLocaleString()}</div>}
                      </div>
                    )}

                    {log.compliance_notes && (
                      <div className="mt-2 text-xs text-amber-700 flex items-start gap-2">
                        <AlertTriangle size={12} />
                        <span>{log.compliance_notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Spray Programs</h3>
            <button
              onClick={() => {
                setShowProgramForm(true);
                setFormError(null);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Program
            </button>
          </div>

          {programs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <Droplets className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600">No programs created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map(program => (
                <div key={program.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500">{program.crop || 'Crop'} • {program.stage || 'Stage'}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(programItemsByProgram[program.id] || []).length === 0 ? (
                      <p className="text-xs text-gray-500">No items yet.</p>
                    ) : (
                      (programItemsByProgram[program.id] || []).map(item => {
                        const chemical = item.chemical_id ? chemicalsById[item.chemical_id] : null;
                        return (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{chemical?.name || 'Chemical'}</span>
                            <span>{item.dose_rate} {item.dose_unit} • {item.interval_days || 0}d interval</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <form onSubmit={handleProgramItemSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        value={programItemForm.programId}
                        onChange={event => setProgramItemForm({ ...programItemForm, programId: event.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Select program</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={programItemForm.chemicalId}
                        onChange={event => setProgramItemForm({ ...programItemForm, chemicalId: event.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Select chemical</option>
                        {chemicals.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Dose"
                        value={programItemForm.doseRate}
                        onChange={event => setProgramItemForm({ ...programItemForm, doseRate: event.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white rounded-lg px-3 py-1 text-sm"
                      >
                        Add Item
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chemicals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Chemical Database</h3>
            <button
              onClick={() => {
                setShowChemicalForm(true);
                setFormError(null);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Chemical
            </button>
          </div>

          {chemicals.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <Droplets className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600">No chemicals yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chemicals.map(chemical => (
                <div key={chemical.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{chemical.name}</p>
                      <p className="text-xs text-gray-500">{chemical.active_ingredient || 'Active ingredient'}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {chemical.phi_days || 0}d PHI • {chemical.rei_hours || 0}h REI
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {chemical.target_pest || 'Target pest'} • {chemical.dose_min || 0}-{chemical.dose_max || 0} {chemical.dose_unit || ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showChemicalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Chemical</h3>
              <button onClick={() => setShowChemicalForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleChemicalSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={chemicalForm.name}
                    onChange={event => setChemicalForm({ ...chemicalForm, name: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Ingredient</label>
                  <input
                    type="text"
                    value={chemicalForm.activeIngredient}
                    onChange={event => setChemicalForm({ ...chemicalForm, activeIngredient: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Pest/Disease</label>
                  <input
                    type="text"
                    value={chemicalForm.targetPest}
                    onChange={event => setChemicalForm({ ...chemicalForm, targetPest: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dose Unit</label>
                  <input
                    type="text"
                    value={chemicalForm.doseUnit}
                    onChange={event => setChemicalForm({ ...chemicalForm, doseUnit: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Dose</label>
                  <input
                    type="number"
                    value={chemicalForm.doseMin}
                    onChange={event => setChemicalForm({ ...chemicalForm, doseMin: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Dose</label>
                  <input
                    type="number"
                    value={chemicalForm.doseMax}
                    onChange={event => setChemicalForm({ ...chemicalForm, doseMax: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PHI (days)</label>
                  <input
                    type="number"
                    value={chemicalForm.phiDays}
                    onChange={event => setChemicalForm({ ...chemicalForm, phiDays: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">REI (hours)</label>
                  <input
                    type="number"
                    value={chemicalForm.reiHours}
                    onChange={event => setChemicalForm({ ...chemicalForm, reiHours: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={chemicalForm.notes}
                  onChange={event => setChemicalForm({ ...chemicalForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Chemical'}
                </button>
                <button type="button" onClick={() => setShowChemicalForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProgramForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Program</h3>
              <button onClick={() => setShowProgramForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleProgramSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  value={programForm.name}
                  onChange={event => setProgramForm({ ...programForm, name: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <input
                  type="text"
                  value={programForm.stage}
                  onChange={event => setProgramForm({ ...programForm, stage: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={programForm.notes}
                  onChange={event => setProgramForm({ ...programForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Program'}
                </button>
                <button type="button" onClick={() => setShowProgramForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Spray Log</h3>
              <button onClick={() => setShowLogForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chemical *</label>
                  <select
                    value={logForm.chemicalId}
                    onChange={event => {
                      const chemical = chemicals.find(c => c.id === event.target.value);
                      setLogForm({
                        ...logForm,
                        chemicalId: event.target.value,
                        doseUnit: chemical?.dose_unit || logForm.doseUnit
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select chemical</option>
                    {chemicals.map(chemical => (
                      <option key={chemical.id} value={chemical.id}>{chemical.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applied At *</label>
                  <input
                    type="datetime-local"
                    value={logForm.appliedAt}
                    onChange={event => setLogForm({ ...logForm, appliedAt: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <select
                    value={logForm.fieldId}
                    onChange={event => setLogForm({ ...logForm, fieldId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select field</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree Block</label>
                  <select
                    value={logForm.treeBlockId}
                    onChange={event => setLogForm({ ...logForm, treeBlockId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select tree block</option>
                    {trees.map(tree => (
                      <option key={tree.id} value={tree.id}>{tree.variety} - Row {tree.row_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orchard</label>
                  <select
                    value={logForm.orchardId}
                    onChange={event => setLogForm({ ...logForm, orchardId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select orchard</option>
                    {orchards.map(orchard => (
                      <option key={orchard.id} value={orchard.id}>{orchard.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select
                    value={logForm.programId}
                    onChange={event => setLogForm({ ...logForm, programId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dose Rate *</label>
                  <input
                    type="number"
                    value={logForm.doseRate}
                    onChange={event => setLogForm({ ...logForm, doseRate: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dose Unit</label>
                  <input
                    type="text"
                    value={logForm.doseUnit}
                    onChange={event => setLogForm({ ...logForm, doseUnit: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (kanal)</label>
                  <input
                    type="number"
                    value={logForm.areaKanal}
                    onChange={event => setLogForm({ ...logForm, areaKanal: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mix Volume (L)</label>
                  <input
                    type="number"
                    value={logForm.mixVolume}
                    onChange={event => setLogForm({ ...logForm, mixVolume: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Pest/Disease</label>
                  <input
                    type="text"
                    value={logForm.targetIssue}
                    onChange={event => setLogForm({ ...logForm, targetIssue: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={logForm.notes}
                  onChange={event => setLogForm({ ...logForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Log'}
                </button>
                <button type="button" onClick={() => setShowLogForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
