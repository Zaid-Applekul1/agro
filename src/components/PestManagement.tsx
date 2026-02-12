import React, { useState } from 'react';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useTrees } from '../hooks/useTrees';
import { useInventory } from '../hooks/useInventory';
import { useOrchards } from '../hooks/useOrchards';
import { useFields } from '../hooks/useFields';
import { useEquipment } from '../hooks/useEquipment';
import { useFinances } from '../hooks/useFinances';
import { Bug, Plus, AlertTriangle, CheckCircle, Clock, Droplets, MapPin, Sprout, Wrench, PoundSterling } from 'lucide-react';

export function PestManagement() {
  const {
    pestTreatments,
    loading: pestLoading,
    error: pestError,
    updatePestTreatment,
    addPestTreatment,
  } = usePestTreatments();
  const { trees, loading: treesLoading } = useTrees();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { treePoints, orchards, loading: orchardsLoading } = useOrchards();
  const { fields, loading: fieldsLoading } = useFields();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { finances, loading: financesLoading } = useFinances();
  const [selectedPest, setSelectedPest] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<(typeof pestTreatments)[number] | null>(null);
  const [updateCompleted, setUpdateCompleted] = useState(false);
  const [updateEffectiveness, setUpdateEffectiveness] = useState('');
  const [updateNextDue, setUpdateNextDue] = useState('');
  const [updateCost, setUpdateCost] = useState('');
  const [formTreeId, setFormTreeId] = useState('');
  const [formPestType, setFormPestType] = useState('');
  const [formStep, setFormStep] = useState('1');
  const [formChemical, setFormChemical] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formApplicationDate, setFormApplicationDate] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formCompleted, setFormCompleted] = useState(false);
  const [formNextDue, setFormNextDue] = useState('');
  const [formEffectiveness, setFormEffectiveness] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loading = pestLoading || treesLoading || inventoryLoading || orchardsLoading || fieldsLoading || equipmentLoading || financesLoading;

  const filteredTreatments = selectedPest === 'all' 
    ? pestTreatments 
    : pestTreatments.filter(t => t.pest_type === selectedPest);

  const completedTreatments = filteredTreatments.filter(t => t.completed).length;
  const pendingTreatments = filteredTreatments.filter(t => !t.completed).length;
  const totalCost = filteredTreatments.reduce((sum, t) => sum + t.cost, 0);
  const effectiveTreatments = filteredTreatments.filter(t => t.effectiveness === 'excellent' || t.effectiveness === 'good').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (pestError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading pest treatments: {pestError}</p>
      </div>
    );
  }

  const pestTypes = [
    { id: 'woolly_aphid', name: 'Woolly Apple Aphid', color: 'bg-red-100 text-red-800' },
    { id: 'codling_moth', name: 'Codling Moth', color: 'bg-orange-100 text-orange-800' },
    { id: 'scale_insects', name: 'Scale Insects', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'mites', name: 'Spider Mites', color: 'bg-purple-100 text-purple-800' },
    { id: 'leaf_roller', name: 'Leaf Roller', color: 'bg-green-100 text-green-800' },
    { id: 'apple_scurf', name: 'Apple Scurf', color: 'bg-blue-100 text-blue-800' },
    { id: 'powdery_mildew', name: 'Powdery Mildew', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'fire_blight', name: 'Fire Blight', color: 'bg-rose-100 text-rose-800' },
    { id: 'sooty_blotch', name: 'Sooty Blotch', color: 'bg-slate-100 text-slate-800' }
  ];

  const commonChemicals = [
    'Imidacloprid',
    'Spinosad',
    'Neem Oil',
    'Kaolin Clay',
    'Copper Oxychloride',
    'Wettable Sulfur',
    'Bacillus thuringiensis'
  ];

  const chemicalOptions = Array.from(new Set([
    ...inventory.filter(item => item.item_type === 'pesticide').map(item => item.name),
    ...commonChemicals,
  ])).filter(Boolean);

  const getPestColor = (pestType: string) => {
    const pest = pestTypes.find(p => p.id === pestType);
    return pest?.color || 'bg-gray-100 text-gray-800';
  };

  const getEffectivenessColor = (effectiveness?: string) => {
    switch (effectiveness) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pestChecklists = {
    woolly_aphid: [
      { step: 1, treatment: 'Imidacloprid Application', timing: 'Early infestation', dosage: '2ml/L' },
      { step: 2, treatment: 'Neem Oil Spray', timing: '15 days after step 1', dosage: '5ml/L' },
      { step: 3, treatment: 'Beneficial Insects Release', timing: 'If infestation persists', dosage: 'As per supplier' }
    ],
    codling_moth: [
      { step: 1, treatment: 'Pheromone Traps', timing: 'Before flowering', dosage: '2 traps/tree' },
      { step: 2, treatment: 'Spinosad Spray', timing: 'Petal fall', dosage: '1ml/L' },
      { step: 3, treatment: 'Kaolin Clay', timing: 'Fruit development', dosage: '50g/L' }
    ]
  };

  const openUpdate = (treatment: (typeof pestTreatments)[number]) => {
    setSelectedTreatment(treatment);
    setUpdateCompleted(!!treatment.completed);
    setUpdateEffectiveness(treatment.effectiveness || '');
    setUpdateNextDue(treatment.next_treatment_due || '');
    setUpdateCost(treatment.cost?.toString() || '');
    setShowUpdateForm(true);
  };

  const openAdd = () => {
    const firstTree = trees[0];
    const firstPest = pestTypes[0];
    const firstChemical = chemicalOptions[0];

    setFormTreeId(firstTree?.id || '');
    setFormPestType(firstPest?.id || '');
    setFormStep('1');
    setFormChemical(firstChemical || '');
    setFormDosage('');
    setFormApplicationDate('');
    setFormCost('');
    setFormCompleted(false);
    setFormNextDue('');
    setFormEffectiveness('');
    setFormError(null);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrated Pest Management</h2>
          <p className="text-gray-600 mt-1">Apple-specific pest control and treatment tracking</p>
        </div>
        <button 
          onClick={openAdd}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Treatment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-800">{completedTreatments}</p>
              <p className="text-xs text-green-600 mt-1">Treatments done</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-800">{pendingTreatments}</p>
              <p className="text-xs text-amber-600 mt-1">Treatments due</p>
            </div>
            <Clock className="text-amber-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div>
            <p className="text-blue-700 font-medium">Total Cost</p>
            <p className="text-2xl font-bold text-blue-800">₹{totalCost.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Treatment expenses</p>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div>
            <p className="text-purple-700 font-medium">Effectiveness</p>
            <p className="text-2xl font-bold text-purple-800">
              {filteredTreatments.length > 0 ? Math.round((effectiveTreatments / filteredTreatments.length) * 100) : 0}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Good/Excellent results</p>
          </div>
        </div>
      </div>

      {/* Pest Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Filter by Pest:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPest('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPest === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Pests
            </button>
            {pestTypes.map(pest => (
              <button
                key={pest.id}
                onClick={() => setSelectedPest(pest.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPest === pest.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pest.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Treatment Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTreatments.map(treatment => {
          const tree = trees.find(t => t.id === treatment.tree_id);
          const pestInfo = pestTypes.find(p => p.id === treatment.pest_type);
          
          return (
            <div key={treatment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bug size={20} className="text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pestInfo?.name}</h3>
                    <p className="text-sm text-gray-600">{tree?.variety} - Row {tree?.row_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {treatment.completed ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <Clock className="text-amber-600" size={20} />
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPestColor(treatment.pest_type)}`}>
                    Step {treatment.treatment_step}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chemical:</span>
                  <span className="font-medium">{treatment.chemical}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Dosage:</span>
                  <span className="font-medium">{treatment.dosage}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Applied:</span>
                  <span className="font-medium">{new Date(treatment.application_date).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-medium text-red-600">₹{treatment.cost || 0}</span>
                </div>

                {treatment.effectiveness && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effectiveness:</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEffectivenessColor(treatment.effectiveness)}`}>
                      {treatment.effectiveness}
                    </span>
                  </div>
                )}
              </div>

              {treatment.next_treatment_due && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span className="text-sm text-amber-800">
                      Next treatment due: {new Date(treatment.next_treatment_due).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openUpdate(treatment)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {treatment.completed ? 'Update' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => {
                    setSelectedTreatment(treatment);
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

      {/* IPM Checklists */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IPM Treatment Protocols</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(pestChecklists).map(([pestId, steps]) => {
            const pestInfo = pestTypes.find(p => p.id === pestId);
            return (
              <div key={pestId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Bug size={18} className="text-red-600" />
                  <h4 className="font-semibold text-gray-900">{pestInfo?.name}</h4>
                </div>
                <div className="space-y-2">
                  {steps.map(step => (
                    <div key={step.step} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                      <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {step.step}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{step.treatment}</p>
                        <p className="text-xs text-gray-600">{step.timing} • {step.dosage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Fields</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{fields.length}</p>
            <p className="text-xs text-green-600 mt-1">Active locations</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Equipment</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{equipment.length}</p>
            <p className="text-xs text-blue-600 mt-1">Available tools</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">GPS Tagged</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{treePoints.length}</p>
            <p className="text-xs text-purple-600 mt-1">Orchard trees</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Treatment Costs</span>
            </div>
            <p className="text-2xl font-bold text-amber-800">
              ₹{pestTreatments.reduce((sum, t) => sum + (t.cost || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-amber-600 mt-1">Total spent</p>
          </div>
        </div>
      </div>

      {/* Chemical Inventory Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Droplets className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Chemical Inventory Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.filter(item => item.item_type === 'pesticide').map(chemical => (
            <div key={chemical.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{chemical.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  (chemical.quantity || 0) < 20 ? 'bg-red-100 text-red-800' : 
                  (chemical.quantity || 0) < 50 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {chemical.quantity} {chemical.unit}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">₹{chemical.price_per_unit}/{chemical.unit}</p>
              {chemical.expiry_date && (
                <p className="text-xs text-gray-500">
                  Expires: {new Date(chemical.expiry_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Treatment Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Record Pest Treatment</h3>
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

                  if (!formTreeId || !formPestType || !formChemical.trim() || !formDosage.trim() || !formApplicationDate) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addPestTreatment({
                    tree_id: formTreeId,
                    pest_type: formPestType,
                    treatment_step: Number(formStep),
                    chemical: formChemical.trim(),
                    dosage: formDosage.trim(),
                    application_date: formApplicationDate,
                    cost: formCost ? Number(formCost) : 0,
                    completed: formCompleted,
                    next_treatment_due: formNextDue || null,
                    effectiveness: formEffectiveness || null,
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setShowAddForm(false);
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tree Block</label>
                    <select
                      value={formTreeId}
                      onChange={event => setFormTreeId(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="" disabled>Select a tree block</option>
                      {trees.map(tree => (
                        <option key={tree.id} value={tree.id}>
                          {tree.variety} - Row {tree.row_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pest Type</label>
                    <select
                      value={formPestType}
                      onChange={event => setFormPestType(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="" disabled>Select pest</option>
                      {pestTypes.map(pest => (
                        <option key={pest.id} value={pest.id}>{pest.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Step</label>
                    <select
                      value={formStep}
                      onChange={event => setFormStep(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="1">Step 1</option>
                      <option value="2">Step 2</option>
                      <option value="3">Step 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Used</label>
                    <select
                      value={formChemical}
                      onChange={event => setFormChemical(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="" disabled>Select chemical</option>
                      {chemicalOptions.map(chemical => (
                        <option key={chemical} value={chemical}>{chemical}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={formDosage}
                      onChange={event => setFormDosage(event.target.value)}
                      placeholder="e.g., 2ml/L"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                    <input
                      type="date"
                      value={formApplicationDate}
                      onChange={event => setFormApplicationDate(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹)</label>
                    <input
                      type="number"
                      value={formCost}
                      onChange={event => setFormCost(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formCompleted ? 'true' : 'false'}
                      onChange={event => setFormCompleted(event.target.value === 'true')}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="false">Pending</option>
                      <option value="true">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Treatment Due</label>
                    <input
                      type="date"
                      value={formNextDue}
                      onChange={event => setFormNextDue(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effectiveness (if completed)</label>
                  <select
                    value={formEffectiveness}
                    onChange={event => setFormEffectiveness(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Not assessed yet</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
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
                    {formSubmitting ? 'Saving...' : 'Record Treatment'}
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

      {showUpdateForm && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Treatment</h3>
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async event => {
                  event.preventDefault();
                  await updatePestTreatment(selectedTreatment.id, {
                    completed: updateCompleted,
                    effectiveness: updateEffectiveness || null,
                    next_treatment_due: updateNextDue || null,
                    cost: updateCost ? Number(updateCost) : selectedTreatment.cost,
                  });
                  setShowUpdateForm(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Completed</label>
                  <input
                    type="checkbox"
                    checked={updateCompleted}
                    onChange={event => setUpdateCompleted(event.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effectiveness</label>
                  <select
                    value={updateEffectiveness}
                    onChange={event => setUpdateEffectiveness(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Not assessed yet</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Treatment Due</label>
                  <input
                    type="date"
                    value={updateNextDue}
                    onChange={event => setUpdateNextDue(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={updateCost}
                    onChange={event => setUpdateCost(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
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

      {showDetails && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Treatment Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Pest:</span> {pestTypes.find(p => p.id === selectedTreatment.pest_type)?.name}</p>
                <p><span className="font-medium">Chemical:</span> {selectedTreatment.chemical}</p>
                <p><span className="font-medium">Dosage:</span> {selectedTreatment.dosage}</p>
                <p><span className="font-medium">Applied:</span> {new Date(selectedTreatment.application_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> {selectedTreatment.completed ? 'Completed' : 'Pending'}</p>
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
    </div>
  );
}