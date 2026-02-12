import { useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useFields } from '../hooks/useFields';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useFinances } from '../hooks/useFinances';
import { Wrench, Calendar, AlertCircle, Plus, Settings, Sprout, Bug, PoundSterling } from 'lucide-react';

export function EquipmentRegistry() {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { equipment, loading, error, addEquipment, updateEquipment } = useEquipment();
  const { fields, loading: fieldsLoading } = useFields();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { finances, loading: finLoading } = useFinances();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editOwnership, setEditOwnership] = useState('owned');
  const [editCondition, setEditCondition] = useState('good');
  const [editDailyCost, setEditDailyCost] = useState('');
  const [maintenanceLast, setMaintenanceLast] = useState('');
  const [maintenanceNext, setMaintenanceNext] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formOwnership, setFormOwnership] = useState('owned');
  const [formCondition, setFormCondition] = useState('good');
  const [formDailyCost, setFormDailyCost] = useState('');
  const [formLastService, setFormLastService] = useState('');
  const [formNextService, setFormNextService] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      case 'needs_repair': return 'bg-amber-100 text-amber-800';
      case 'out_of_service': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOwnershipColor = (ownership: string) => {
    switch (ownership) {
      case 'owned':
        return 'bg-green-100 text-green-800';
      case 'leased':
        return 'bg-blue-100 text-blue-800';
      case 'rented':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const needsService = (nextService: string | null) => {
    if (!nextService) return false;
    const serviceDate = new Date(nextService);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return serviceDate <= thirtyDaysFromNow;
  };

  const totalDailyCost = equipment.reduce((sum, eq) => sum + (eq.daily_cost || 0), 0);
  const ownedCount = equipment.filter(eq => eq.ownership === 'owned').length;
  const leasedCount = equipment.filter(eq => eq.ownership === 'leased').length;
  const servicesDue = equipment.filter(eq => needsService(eq.next_service)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Equipment Registry</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Equipment</p>
              <p className="text-2xl font-bold text-blue-800">{equipment.length}</p>
              <p className="text-xs text-blue-600 mt-1">{ownedCount} owned, {leasedCount} leased</p>
            </div>
            <Wrench className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div>
            <p className="text-green-700 font-medium">Daily Lease Cost</p>
            <p className="text-2xl font-bold text-green-800">₹{totalDailyCost}</p>
            <p className="text-xs text-green-600 mt-1">Active leases only</p>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div>
            <p className="text-purple-700 font-medium">Owned Assets</p>
            <p className="text-2xl font-bold text-purple-800">{ownedCount}</p>
            <p className="text-xs text-purple-600 mt-1">{equipment.length > 0 ? Math.round((ownedCount / equipment.length) * 100) : 0}% of fleet</p>
          </div>
        </div>

        <div className={`${servicesDue > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${servicesDue > 0 ? 'text-amber-700' : 'text-green-700'} font-medium`}>Services Due</p>
              <p className={`text-2xl font-bold ${servicesDue > 0 ? 'text-amber-800' : 'text-green-800'}`}>{servicesDue}</p>
              <p className={`text-xs ${servicesDue > 0 ? 'text-amber-600' : 'text-green-600'} mt-1`}>Within 30 days</p>
            </div>
            {servicesDue > 0 && <AlertCircle className="text-amber-600" size={24} />}
          </div>
        </div>
      </div>

      {(loading || fieldsLoading || pestLoading || finLoading) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
          Loading equipment...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          {error}
        </div>
      )}

      {/* Service Alerts */}
      {servicesDue > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-amber-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">Upcoming Service Requirements</h3>
              <div className="mt-2 space-y-1">
                {equipment.filter(eq => needsService(eq.next_service)).map(equipment => (
                  <p key={equipment.id} className="text-sm text-amber-700">
                    • {equipment.name} - Service due {equipment.next_service ? new Date(equipment.next_service).toLocaleDateString() : 'TBD'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {equipment.map(equipment => (
          <div key={equipment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings size={20} className="text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOwnershipColor(equipment.ownership || 'owned')}`}>
                {equipment.ownership}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{equipment.equipment_type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getConditionColor(equipment.condition || 'good')}`}>
                  {equipment.condition || 'unknown'}
                </span>
              </div>
              
              {equipment.daily_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Cost:</span>
                  <span className="font-medium text-red-600">₹{equipment.daily_cost}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Last service: {equipment.last_maintenance ? new Date(equipment.last_maintenance).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar size={14} className={needsService(equipment.next_service) ? 'text-amber-500' : 'text-gray-400'} />
                <span className={`text-sm ${needsService(equipment.next_service) ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                  Next service: {equipment.next_service ? new Date(equipment.next_service).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedEquipment(equipment.id);
                  setEditOwnership(equipment.ownership || 'owned');
                  setEditCondition(equipment.condition || 'good');
                  setEditDailyCost(equipment.daily_cost ? equipment.daily_cost.toString() : '');
                  setShowUpdateForm(true);
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedEquipment(equipment.id);
                  setMaintenanceLast(equipment.last_maintenance || '');
                  setMaintenanceNext(equipment.next_service || '');
                  setShowMaintenanceForm(true);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Maintenance
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && equipment.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-600">
          <p className="font-medium">No equipment registered.</p>
          <p className="text-sm mt-1">Add equipment to track maintenance.</p>
        </div>
      )}

      {/* Farm Integration Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Fields Served</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{fields.length}</p>
            <p className="text-xs text-green-600 mt-1">Active locations</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bug size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">Spray Operations</span>
            </div>
            <p className="text-2xl font-bold text-red-800">{pestTreatments.length}</p>
            <p className="text-xs text-red-600 mt-1">Treatments applied</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Equipment Costs</span>
            </div>
            <p className="text-2xl font-bold text-amber-800">
              ₹{finances.filter(f => f.category === 'equipment').reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-amber-600 mt-1">Total investment</p>
          </div>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipment.map(equipment => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">{equipment.name}</td>
                  <td className="px-4 py-4 text-gray-600">{equipment.equipment_type}</td>
                  <td className="px-4 py-4 text-gray-600">{equipment.last_maintenance ? new Date(equipment.last_maintenance).toLocaleDateString() : 'TBD'}</td>
                  <td className="px-4 py-4 text-gray-600">{equipment.next_service ? new Date(equipment.next_service).toLocaleDateString() : 'TBD'}</td>
                  <td className="px-4 py-4">
                    {needsService(equipment.next_service) ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Service Due
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Up to Date
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Equipment</h3>
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

                  if (!formName || !formType) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addEquipment({
                    name: formName.trim(),
                    equipment_type: formType.trim(),
                    ownership: formOwnership,
                    condition: formCondition,
                    daily_cost: formDailyCost ? Number(formDailyCost) : 0,
                    last_maintenance: formLastService || null,
                    next_service: formNextService || null,
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setFormName('');
                  setFormType('');
                  setFormOwnership('owned');
                  setFormCondition('good');
                  setFormDailyCost('');
                  setFormLastService('');
                  setFormNextService('');
                  setShowAddForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={event => setFormName(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    value={formType}
                    onChange={event => setFormType(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                    <select
                      value={formOwnership}
                      onChange={event => setFormOwnership(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="owned">Owned</option>
                      <option value="leased">Leased</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={formCondition}
                      onChange={event => setFormCondition(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {['excellent', 'good', 'fair', 'poor', 'needs_repair', 'out_of_service'].map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cost (₹)</label>
                  <input
                    type="number"
                    value={formDailyCost}
                    onChange={event => setFormDailyCost(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Service</label>
                    <input
                      type="date"
                      value={formLastService}
                      onChange={event => setFormLastService(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Service</label>
                    <input
                      type="date"
                      value={formNextService}
                      onChange={event => setFormNextService(event.target.value)}
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
                    {formSubmitting ? 'Saving...' : 'Add Equipment'}
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

      {showUpdateForm && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Equipment</h3>
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
                  await updateEquipment(selectedEquipment, {
                    ownership: editOwnership,
                    condition: editCondition,
                    daily_cost: editDailyCost ? Number(editDailyCost) : 0,
                  });
                  setShowUpdateForm(false);
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                    <select
                      value={editOwnership}
                      onChange={event => setEditOwnership(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="owned">Owned</option>
                      <option value="leased">Leased</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={editCondition}
                      onChange={event => setEditCondition(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {['excellent', 'good', 'fair', 'poor', 'needs_repair', 'out_of_service'].map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cost (₹)</label>
                  <input
                    type="number"
                    value={editDailyCost}
                    onChange={event => setEditDailyCost(event.target.value)}
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

      {showMaintenanceForm && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Maintenance</h3>
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async event => {
                  event.preventDefault();
                  await updateEquipment(selectedEquipment, {
                    last_maintenance: maintenanceLast || null,
                    next_service: maintenanceNext || null,
                  });
                  setShowMaintenanceForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Service</label>
                  <input
                    type="date"
                    value={maintenanceLast}
                    onChange={event => setMaintenanceLast(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Service</label>
                  <input
                    type="date"
                    value={maintenanceNext}
                    onChange={event => setMaintenanceNext(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Save Maintenance
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceForm(false)}
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