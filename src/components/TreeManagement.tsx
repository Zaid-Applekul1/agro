import React, { useMemo, useState } from 'react';
import { useTrees } from '../hooks/useTrees';
import { useFields } from '../hooks/useFields';
import { useDeadTrees } from '../hooks/useDeadTrees';
import { useOrchards } from '../hooks/useOrchards';
import { useHarvest } from '../hooks/useHarvest';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useFinances } from '../hooks/useFinances';
import { AlertTriangle, DollarSign, Plus, Scissors, Skull, TrendingUp, TreePine, MapPin, Apple, Bug, PoundSterling } from 'lucide-react';

export function TreeManagement() {
  const { trees, loading: treesLoading, error: treesError, addTree, updateTree } = useTrees();
  const { fields, loading: fieldsLoading } = useFields();
  const { records: deadRecords, loading: deadLoading, error: deadError, addRecord } = useDeadTrees();
  const { treePoints, orchards, loading: orchardsLoading } = useOrchards();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { finances, loading: financesLoading } = useFinances();
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeadForm, setShowDeadForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<(typeof trees)[number] | null>(null);
  const [statusValue, setStatusValue] = useState('healthy');
  const [formFieldId, setFormFieldId] = useState('');
  const [formRowNumber, setFormRowNumber] = useState('');
  const [formVariety, setFormVariety] = useState('');
  const [formTreeCount, setFormTreeCount] = useState('');
  const [formStatus, setFormStatus] = useState('healthy');
  const [formPlantingYear, setFormPlantingYear] = useState('');
  const [formYieldEstimate, setFormYieldEstimate] = useState('');
  const [formLastPruned, setFormLastPruned] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deadFormError, setDeadFormError] = useState<string | null>(null);
  const [deadFormSubmitting, setDeadFormSubmitting] = useState(false);
  const [deadForm, setDeadForm] = useState({
    fieldId: '',
    treeId: '',
    recordedDate: '',
    deadCount: '',
    cause: 'disease',
    replacementSource: '',
    rootstockSource: '',
    costPerPlant: '',
    replacementCount: '',
    replacementDate: '',
    survivalRate: '',
    notes: '',
  });

  const loading = treesLoading || fieldsLoading || deadLoading || orchardsLoading;

  const filteredTrees = trees.filter(tree => {
    const matchesField = selectedField === 'all' || tree.field_id === selectedField;
    const matchesVariety = selectedVariety === 'all' || tree.variety === selectedVariety;
    return matchesField && matchesVariety;
  });

  const varieties = Array.from(new Set(trees.map(tree => tree.variety)));
  const totalTrees = filteredTrees.reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
  const totalYieldEstimate = filteredTrees.reduce((sum, tree) => sum + (tree.yield_estimate || 0), 0);
  const healthyTrees = filteredTrees.filter(tree => tree.status === 'healthy').length;
  const filteredDeadRecords = useMemo(() => {
    if (selectedField === 'all') return deadRecords;
    return deadRecords.filter(record => record.field_id === selectedField);
  }, [deadRecords, selectedField]);

  const totalDeadTrees = filteredDeadRecords.reduce((sum, record) => sum + (record.dead_count || 0), 0);
  const mortalityRate = totalTrees > 0 ? (totalDeadTrees / totalTrees) * 100 : 0;
  const replacementCost = filteredDeadRecords.reduce(
    (sum, record) => sum + (record.replacement_count || 0) * (record.cost_per_plant || 0),
    0
  );
  const survivalRate = useMemo(() => {
    const weighted = filteredDeadRecords.reduce(
      (sum, record) => sum + (record.survival_rate_pct || 0) * (record.replacement_count || 0),
      0
    );
    const totalReplacements = filteredDeadRecords.reduce((sum, record) => sum + (record.replacement_count || 0), 0);
    if (totalReplacements === 0) return 0;
    return weighted / totalReplacements;
  }, [filteredDeadRecords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (treesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading trees: {treesError}</p>
      </div>
    );
  }

  if (deadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dead tree records: {deadError}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'diseased': return 'bg-red-100 text-red-800';
      case 'pruned': return 'bg-blue-100 text-blue-800';
      case 'dormant': return 'bg-gray-100 text-gray-800';
      case 'stressed': return 'bg-amber-100 text-amber-800';
      case 'recovering': return 'bg-emerald-100 text-emerald-800';
      case 'removed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarietyColor = (variety: string) => {
    switch (variety) {
      case 'Ambri': return 'bg-purple-100 text-purple-800';
      case 'Royal Delicious': return 'bg-red-100 text-red-800';
      case 'Red Delicious': return 'bg-pink-100 text-pink-800';
      case 'Golden Delicious': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tree Block Management</h2>
          <p className="text-gray-600 mt-1">Track apple varieties and tree health by blocks</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Tree Block</span>
          </button>
          <button
            onClick={() => {
              setDeadForm({
                fieldId: selectedField === 'all' ? '' : selectedField,
                treeId: '',
                recordedDate: '',
                deadCount: '',
                cause: 'disease',
                replacementSource: '',
                rootstockSource: '',
                costPerPlant: '',
                replacementCount: '',
                replacementDate: '',
                survivalRate: '',
                notes: '',
              });
              setDeadFormError(null);
              setShowDeadForm(true);
            }}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Skull size={16} />
            <span>Mark Dead Trees</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Total Trees</p>
              <p className="text-2xl font-bold text-green-800">{totalTrees.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">{filteredTrees.length} blocks</p>
            </div>
            <TreePine className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div>
            <p className="text-blue-700 font-medium">Varieties</p>
            <p className="text-2xl font-bold text-blue-800">{varieties.length}</p>
            <p className="text-xs text-blue-600 mt-1">Apple cultivars</p>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-medium">Est. Yield</p>
              <p className="text-2xl font-bold text-purple-800">{totalYieldEstimate}</p>
              <p className="text-xs text-purple-600 mt-1">Bins this season</p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div>
            <p className="text-amber-700 font-medium">Healthy Blocks</p>
            <p className="text-2xl font-bold text-amber-800">{healthyTrees}/{filteredTrees.length}</p>
            <p className="text-xs text-amber-600 mt-1">{Math.round((healthyTrees / filteredTrees.length) * 100)}% healthy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-700 font-medium">Dead Trees</p>
              <p className="text-2xl font-bold text-rose-800">{totalDeadTrees}</p>
              <p className="text-xs text-rose-600 mt-1">Mortality rate {mortalityRate.toFixed(1)}%</p>
            </div>
            <Skull className="text-rose-600" size={24} />
          </div>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 font-medium">Replacement Cost</p>
              <p className="text-2xl font-bold text-amber-800">₹{replacementCost.toLocaleString()}</p>
              <p className="text-xs text-amber-600 mt-1">Total impact this season</p>
            </div>
            <DollarSign className="text-amber-600" size={24} />
          </div>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
          <div>
            <p className="text-emerald-700 font-medium">Survival Rate</p>
            <p className="text-2xl font-bold text-emerald-800">{survivalRate.toFixed(1)}%</p>
            <p className="text-xs text-emerald-600 mt-1">Weighted by replacements</p>
          </div>
        </div>
        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
          <div>
            <p className="text-slate-700 font-medium">Replacement Count</p>
            <p className="text-2xl font-bold text-slate-800">
              {filteredDeadRecords.reduce((sum, record) => sum + (record.replacement_count || 0), 0)}
            </p>
            <p className="text-xs text-slate-600 mt-1">Plants replaced</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedField('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedField === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Fields
            </button>
            {fields.map(field => (
              <button
                key={field.id}
                onClick={() => setSelectedField(field.id!)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedField === field.id! ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {field.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Variety:</span>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Varieties</option>
              {varieties.map(variety => (
                <option key={variety} value={variety}>{variety}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tree Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrees.map(tree => {
          const field = fields.find(f => f.id === tree.field_id);
          return (
            <div key={tree.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TreePine size={20} className="text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Row {tree.row_number}</h3>
                    <p className="text-sm text-gray-600">{field?.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getVarietyColor(tree.variety)}`}>
                  {tree.variety}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tree Count:</span>
                  <span className="font-medium">{tree.tree_count} trees</span>
                </div>
                
                {(() => {
                  const taggedCount = treePoints.filter(pt => pt.tree_block_id === tree.id).length;
                  if (taggedCount > 0) {
                    return (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <MapPin size={14} className="text-green-600" />
                          Orchard Tagged:
                        </span>
                        <span className="font-medium text-green-600">{taggedCount} GPS points</span>
                      </div>
                    );
                  }
                })()}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(tree.status || 'healthy')}`}>
                    {tree.status || 'healthy'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Planted:</span>
                  <span className="font-medium">{tree.planting_year}</span>
                </div>

                {tree.yield_estimate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Yield:</span>
                    <span className="font-medium text-green-600">{tree.yield_estimate} bins</span>
                  </div>
                )}
              </div>

              {tree.last_pruned && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Scissors size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Last pruned: {new Date(tree.last_pruned).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {(() => {
                const blockHarvests = harvest.filter(h => h.tree_id === tree.id);
                const blockPests = pestTreatments.filter(p => p.tree_id === tree.id);
                const blockCosts = finances.filter(f => f.category === 'labor' || f.category === 'fertilizer').slice(0, 1);
                
                if (blockHarvests.length > 0 || blockPests.length > 0 || blockCosts.length > 0) {
                  return (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      {blockHarvests.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Apple size={14} className="text-green-600" />
                            Harvests:
                          </span>
                          <span className="font-medium text-green-600">{blockHarvests.length} records</span>
                        </div>
                      )}
                      {blockPests.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Bug size={14} className="text-red-600" />
                            Treatments:
                          </span>
                          <span className="font-medium text-red-600">{blockPests.length} applied</span>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setSelectedTree(tree);
                    setShowDetails(true);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dead Tree Records</h3>
          <AlertTriangle size={18} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cause</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Replacement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Plant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Survival %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeadRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No dead tree records logged.
                  </td>
                </tr>
              )}
              {filteredDeadRecords.map(record => {
                const tree = trees.find(item => item.id === record.tree_id);
                const field = fields.find(item => item.id === record.field_id);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(record.recorded_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{field?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{tree?.row_number || '-'}</td>
                    <td className="px-4 py-3">{record.dead_count || 0}</td>
                    <td className="px-4 py-3 capitalize">{record.cause.replace('_', ' ')}</td>
                    <td className="px-4 py-3">{record.replacement_count || 0}</td>
                    <td className="px-4 py-3">₹{(record.cost_per_plant || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{record.survival_rate_pct ? `${record.survival_rate_pct}%` : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variety Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variety Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blocks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trees</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Yield</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Age</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {varieties.map(variety => {
                const varietyTrees = trees.filter(tree => tree.variety === variety);
                const totalTrees = varietyTrees.reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
                const totalYield = varietyTrees.reduce((sum, tree) => sum + (tree.yield_estimate || 0), 0);
                const avgAge = Math.round(varietyTrees.reduce((sum, tree) => sum + (2024 - tree.planting_year), 0) / varietyTrees.length);
                const healthyCount = varietyTrees.filter(tree => tree.status === 'healthy').length;
                
                return (
                  <tr key={variety} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-sm rounded-full font-medium ${getVarietyColor(variety)}`}>
                        {variety}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-900">{varietyTrees.length}</td>
                    <td className="px-4 py-4 text-gray-900">{totalTrees}</td>
                    <td className="px-4 py-4 font-medium text-green-600">{totalYield} bins</td>
                    <td className="px-4 py-4 text-gray-900">{avgAge} years</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        healthyCount === varietyTrees.length ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {healthyCount}/{varietyTrees.length} healthy
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Tree Block</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async event => {
                  event.preventDefault();
                  setFormError(null);

                  if (!formFieldId || !formRowNumber || !formVariety || !formTreeCount || !formPlantingYear) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addTree({
                    field_id: formFieldId,
                    row_number: Number(formRowNumber),
                    variety: formVariety.trim(),
                    tree_count: Number(formTreeCount),
                    status: formStatus,
                    planting_year: Number(formPlantingYear),
                    yield_estimate: formYieldEstimate ? Number(formYieldEstimate) : 0,
                    last_pruned: formLastPruned || null,
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setFormFieldId('');
                  setFormRowNumber('');
                  setFormVariety('');
                  setFormTreeCount('');
                  setFormStatus('healthy');
                  setFormPlantingYear('');
                  setFormYieldEstimate('');
                  setFormLastPruned('');
                  setShowAddForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <select
                    value={formFieldId}
                    onChange={event => setFormFieldId(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="" disabled>Select a field</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Row Number</label>
                    <input
                      type="number"
                      value={formRowNumber}
                      onChange={event => setFormRowNumber(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                    <input
                      type="text"
                      value={formVariety}
                      onChange={event => setFormVariety(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tree Count</label>
                    <input
                      type="number"
                      value={formTreeCount}
                      onChange={event => setFormTreeCount(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Year</label>
                    <input
                      type="number"
                      value={formPlantingYear}
                      onChange={event => setFormPlantingYear(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={event => setFormStatus(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {['healthy', 'diseased', 'pruned', 'dormant', 'stressed', 'recovering', 'removed'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yield Estimate (bins)</label>
                    <input
                      type="number"
                      value={formYieldEstimate}
                      onChange={event => setFormYieldEstimate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Pruned</label>
                  <input
                    type="date"
                    value={formLastPruned}
                    onChange={event => setFormLastPruned(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Add Block'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showStatusForm && selectedTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                <button
                  onClick={() => setShowStatusForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async event => {
                  event.preventDefault();
                  await updateTree(selectedTree.id, { status: statusValue });
                  setShowStatusForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusValue}
                    onChange={event => setStatusValue(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {['healthy', 'diseased', 'pruned', 'dormant', 'stressed', 'recovering', 'removed'].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStatusForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tree Block Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Field:</span> {fields.find(field => field.id === selectedTree.field_id)?.name || 'Unknown'}</p>
                <p><span className="font-medium">Row:</span> {selectedTree.row_number}</p>
                <p><span className="font-medium">Variety:</span> {selectedTree.variety}</p>
                <p><span className="font-medium">Tree Count:</span> {selectedTree.tree_count}</p>
                <p><span className="font-medium">Status:</span> {selectedTree.status}</p>
                <p><span className="font-medium">Planted:</span> {selectedTree.planting_year}</p>
                {selectedTree.last_pruned && (
                  <p><span className="font-medium">Last Pruned:</span> {new Date(selectedTree.last_pruned).toLocaleDateString()}</p>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Log Dead Trees</h3>
                <button
                  onClick={() => setShowDeadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async event => {
                  event.preventDefault();
                  setDeadFormError(null);

                  if (!deadForm.treeId || !deadForm.recordedDate || !deadForm.deadCount || !deadForm.cause) {
                    setDeadFormError('Tree block, date, dead count, and cause are required.');
                    return;
                  }

                  setDeadFormSubmitting(true);
                  const { error: submitError } = await addRecord({
                    tree_id: deadForm.treeId,
                    field_id: deadForm.fieldId || null,
                    recorded_date: deadForm.recordedDate,
                    dead_count: Number(deadForm.deadCount || 0),
                    cause: deadForm.cause,
                    replacement_source: deadForm.replacementSource.trim() || null,
                    rootstock_source: deadForm.rootstockSource.trim() || null,
                    cost_per_plant: Number(deadForm.costPerPlant || 0),
                    replacement_count: Number(deadForm.replacementCount || 0),
                    replacement_date: deadForm.replacementDate || null,
                    survival_rate_pct: deadForm.survivalRate ? Number(deadForm.survivalRate) : null,
                    notes: deadForm.notes.trim() || null,
                  });
                  setDeadFormSubmitting(false);

                  if (submitError) {
                    setDeadFormError(submitError);
                    return;
                  }

                  setShowDeadForm(false);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                    <select
                      value={deadForm.fieldId}
                      onChange={event => setDeadForm({ ...deadForm, fieldId: event.target.value, treeId: '' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
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
                      value={deadForm.treeId}
                      onChange={event => setDeadForm({ ...deadForm, treeId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select tree block</option>
                      {trees
                        .filter(tree => !deadForm.fieldId || tree.field_id === deadForm.fieldId)
                        .map(tree => (
                          <option key={tree.id} value={tree.id}>
                            Row {tree.row_number} - {tree.variety}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recorded Date</label>
                    <input
                      type="date"
                      value={deadForm.recordedDate}
                      onChange={event => setDeadForm({ ...deadForm, recordedDate: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dead Count</label>
                    <input
                      type="number"
                      min={0}
                      value={deadForm.deadCount}
                      onChange={event => setDeadForm({ ...deadForm, deadCount: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
                  <select
                    value={deadForm.cause}
                    onChange={event => setDeadForm({ ...deadForm, cause: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="disease">Disease</option>
                    <option value="pest">Pest</option>
                    <option value="frost">Frost</option>
                    <option value="drought">Drought</option>
                    <option value="root_damage">Root Damage</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Source</label>
                    <input
                      type="text"
                      value={deadForm.replacementSource}
                      onChange={event => setDeadForm({ ...deadForm, replacementSource: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rootstock Source</label>
                    <input
                      type="text"
                      value={deadForm.rootstockSource}
                      onChange={event => setDeadForm({ ...deadForm, rootstockSource: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Plant</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={deadForm.costPerPlant}
                      onChange={event => setDeadForm({ ...deadForm, costPerPlant: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Count</label>
                    <input
                      type="number"
                      min={0}
                      value={deadForm.replacementCount}
                      onChange={event => setDeadForm({ ...deadForm, replacementCount: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Survival Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={deadForm.survivalRate}
                      onChange={event => setDeadForm({ ...deadForm, survivalRate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
                  <input
                    type="date"
                    value={deadForm.replacementDate}
                    onChange={event => setDeadForm({ ...deadForm, replacementDate: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={deadForm.notes}
                    onChange={event => setDeadForm({ ...deadForm, notes: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
                </div>

                {deadFormError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {deadFormError}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={deadFormSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {deadFormSubmitting ? 'Saving...' : 'Save Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeadForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}