import { useMemo, useState } from 'react';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useOrchards } from '../hooks/useOrchards';
import { useHarvest } from '../hooks/useHarvest';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useEquipment } from '../hooks/useEquipment';
import { useFinances } from '../hooks/useFinances';
import { OrchardMap } from './OrchardMap';
import {
  Sprout,
  MapPin,
  Calendar,
  Filter,
  Droplets,
  Plus,
  ChevronDown,
  ChevronUp,
  Map,
  Edit3,
  Apple,
  Bug,
  Wrench,
  PoundSterling,
  TreePine,
  Leaf
} from 'lucide-react';

const calculateFieldAge = (plantingDate: string): string => {
  const today = new Date();
  const planting = new Date(plantingDate);
  const diffTime = Math.abs(today.getTime() - planting.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    return `${years}y ${remainingMonths}m`;
  } else if (months > 0) {
    return `${months}m ${diffDays % 30}d`;
  } else {
    return `${diffDays}d`;
  }
};

export function FieldManagement() {
  const { fields, loading, error, addField, updateField } = useFields();
  const { trees, loading: treesLoading } = useTrees();
  const { orchards, treePoints, loading: orchardsLoading } = useOrchards();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { finances, loading: financesLoading } = useFinances();
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCrop, setFormCrop] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formPlantingDate, setFormPlantingDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState('');

  const crops = useMemo(() => {
    const unique = Array.from(new Set(fields.map(field => field.crop)));
    return ['all', ...unique];
  }, [fields]);

  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      const matchesCrop = selectedCrop === 'all' || field.crop === selectedCrop;
      const matchesSearch =
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.crop.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCrop && matchesSearch;
    });
  }, [fields, selectedCrop, searchTerm]);

  const totalArea = fields.reduce((sum, field) => sum + (field.area || 0), 0);
  const totalApplications = fields.reduce(
    (sum, field) => sum + (field.fertilizer_applications?.length || 0),
    0
  );
  const totalTreeCount = trees.reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
  const totalTreeBlocks = trees.length;

  const startEditFieldName = (fieldId: string, currentName: string) => {
    setEditingFieldId(fieldId);
    setEditFieldName(currentName);
  };

  const cancelEditFieldName = () => {
    setEditingFieldId(null);
    setEditFieldName('');
  };

  const saveFieldName = async (fieldId: string) => {
    if (!editFieldName.trim()) {
      cancelEditFieldName();
      return;
    }

    const result = await updateField(fieldId, { name: editFieldName.trim() });
    if (result.error) {
      alert('Error updating field name: ' + result.error);
    }
    setEditingFieldId(null);
    setEditFieldName('');
  };

  if (loading || treesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading fields: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fields & Tree Block Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage fields, tree blocks, varieties, and GPS mapping</p>
        </div>
        <button
          onClick={() => setShowAddChoice(true)}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Field</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Total Fields</p>
              <p className="text-2xl font-bold text-green-800">{fields.length}</p>
            </div>
            <Sprout className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Area</p>
              <p className="text-2xl font-bold text-blue-800">{totalArea.toFixed(1)} kanal</p>
            </div>
            <MapPin className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-medium text-sm">Tree Blocks</p>
              <p className="text-2xl font-bold text-purple-800">{totalTreeBlocks}</p>
            </div>
            <TreePine className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 font-medium text-sm">Total Trees</p>
              <p className="text-2xl font-bold text-amber-800">{totalTreeCount}</p>
            </div>
            <Leaf className="text-amber-600" size={24} />
          </div>
        </div>

        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-700 font-medium text-sm">Crop Types</p>
              <p className="text-2xl font-bold text-teal-800">{crops.length - 1}</p>
            </div>
            <Filter className="text-teal-600" size={24} />
          </div>
        </div>
      </div>

      {!showMapView && <OrchardMap />}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <span className="font-medium text-gray-700">Filter fields</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {crops.map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCrop === crop
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {crop === 'all' ? 'All Crops' : crop}
              </button>
            ))}
          </div>



          <div className="relative">
            <input
              type="text"
              placeholder="Search fields or crops"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Fertilizer Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fertilizer Applications</h3>
            <p className="text-sm text-gray-600 mt-1">Total applications recorded across all fields</p>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="text-blue-600" size={20} />
            <span className="text-xl font-bold text-blue-800">{totalApplications}</span>
          </div>
        </div>
      </div>

      {/* Field Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFields.map(field => {
          const isExpanded = expandedFieldId === field.id;

          return (
            <div key={field.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingFieldId === field.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editFieldName}
                        onChange={(e) => setEditFieldName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveFieldName(field.id);
                          if (e.key === 'Escape') cancelEditFieldName();
                        }}
                        className="text-lg font-semibold text-gray-900 border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveFieldName(field.id)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditFieldName}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                      <button
                        onClick={() => startEditFieldName(field.id, field.name)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit field name"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{field.crop} · {field.area} kanal</p>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">Planting Date</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{new Date(field.planting_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Field Age</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-700">{calculateFieldAge(field.planting_date)}</span>
                  </div>
                </div>
              </div>

              {(() => {
                const fieldOrchards = orchards.filter(o => o.field_id === field.id);
                const fieldTrees = trees.filter(t => t.field_id === field.id);
                const totalOrchardTrees = fieldOrchards.reduce((sum, o) => sum + (o.tree_count || 0), 0);
                const totalTreesInBlocks = fieldTrees.reduce((sum, t) => sum + (t.tree_count || 0), 0);
                const varieties = Array.from(new Set(fieldTrees.map(t => t.variety)));
                
                return (
                  <>
                    {fieldOrchards.length > 0 && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-green-600" />
                            <span className="text-sm font-semibold text-green-900">
                              {fieldOrchards.length} Orchard{fieldOrchards.length > 1 ? 's' : ''} Mapped
                            </span>
                          </div>
                          <span className="text-xs text-green-700">
                            {totalOrchardTrees} trees tagged
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-green-700">
                          {fieldOrchards.map(o => o.name).join(', ')}
                        </div>
                      </div>
                    )}

                    {fieldTrees.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <TreePine size={16} className="text-purple-600" />
                            Tree Blocks ({fieldTrees.length})
                          </h4>
                          <span className="text-xs text-gray-500">{totalTreesInBlocks} total trees</span>
                        </div>
                        <div className="space-y-2">
                          {fieldTrees.map(tree => (
                            <div key={tree.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-purple-900">Row {tree.row_number}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                      {tree.variety}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      tree.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {tree.status || 'healthy'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span>{tree.tree_count} trees</span>
                                    <span>Planted: {tree.planting_year}</span>
                                    {tree.yield_estimate && <span>Est. {tree.yield_estimate} bins</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {varieties.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              <strong>Varieties:</strong> {varieties.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

              {isExpanded && (
                <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const fieldHarvests = harvest.filter(h => {
                        const harvestField = fields.find(f => f.id === h.tree_id);
                        return harvestField?.id === field.id;
                      });
                      const fieldPests = pestTreatments.filter(p => {
                        const pestField = fields.find(f => f.id === p.tree_id);
                        return pestField?.id === field.id;
                      });
                      const fieldCosts = finances.filter(f => f.category === 'fertilizer' || f.category === 'labor').slice(0, 3);
                      
                      return (
                        <>
                          {fieldHarvests.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Apple size={14} className="text-green-600" />
                                <span className="text-xs font-medium text-green-700">Harvests</span>
                              </div>
                              <p className="text-lg font-bold text-green-800">{fieldHarvests.length}</p>
                            </div>
                          )}
                          {fieldPests.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Bug size={14} className="text-red-600" />
                                <span className="text-xs font-medium text-red-700">Treatments</span>
                              </div>
                              <p className="text-lg font-bold text-red-800">{fieldPests.length}</p>
                            </div>
                          )}
                          {equipment.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Wrench size={14} className="text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Equipment</span>
                              </div>
                              <p className="text-lg font-bold text-blue-800">{equipment.length}</p>
                            </div>
                          )}
                          {fieldCosts.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <PoundSterling size={14} className="text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">Costs</span>
                              </div>
                              <p className="text-lg font-bold text-amber-800">{fieldCosts.length}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Fertilizer History</h4>
                    <span className="text-xs text-gray-500">{field.fertilizer_applications?.length || 0} records</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(!field.fertilizer_applications || field.fertilizer_applications.length === 0) && (
                      <p className="text-sm text-gray-500">No fertilizer applications recorded.</p>
                    )}
                    {field.fertilizer_applications?.map(application => (
                      <div key={application.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900">{application.type}</p>
                          <p className="text-xs text-gray-500">{new Date(application.application_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{application.amount} kg</p>
                          <p className="text-xs text-gray-500">₹{application.cost?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFields.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-600">
          <p className="font-medium">No fields match the current filters.</p>
          <p className="text-sm mt-1">Try clearing filters or updating your search term.</p>
        </div>
      )}

      {/* Add Field Choice Modal */}
      {showAddChoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">How would you like to add a field?</h3>
                <button
                  onClick={() => setShowAddChoice(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAddChoice(false);
                    setShowMapView(true);
                  }}
                  className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Map size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Map View</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Draw field boundaries on a map, upload KML files, and tag trees with GPS
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowAddChoice(false);
                    setShowAddForm(true);
                  }}
                  className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Edit3 size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Manual Entry</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter field details manually with a simple form
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowAddChoice(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {showMapView && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowMapView(false)}
          />
          <div className="relative h-full flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-6xl w-full my-8 relative z-10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Map-Based Field Creation</h3>
                  <button
                    onClick={() => setShowMapView(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <OrchardMap />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Field</h3>
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

                  if (!formName.trim() || !formCrop.trim() || !formArea || !formPlantingDate) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addField({
                    name: formName.trim(),
                    crop: formCrop.trim(),
                    area: Number(formArea),
                    planting_date: formPlantingDate,
                    last_updated: new Date().toISOString(),
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setFormName('');
                  setFormCrop('');
                  setFormArea('');
                  setFormPlantingDate('');
                  setShowAddForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={event => setFormName(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <input
                    type="text"
                    value={formCrop}
                    onChange={event => setFormCrop(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1\">Area (kanal)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formArea}
                    onChange={event => setFormArea(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 5.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={formPlantingDate}
                    onChange={event => setFormPlantingDate(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
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
                    {formSubmitting ? 'Saving...' : 'Add Field'}
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
    </div>
  );
}
