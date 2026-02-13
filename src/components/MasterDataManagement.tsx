import { FormEvent, useMemo, useState } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

type TabKey = 'crops' | 'varieties' | 'chemicals' | 'fertilizers' | 'units' | 'regions' | 'suppliers';

export function MasterDataManagement() {
  const {
    crops,
    varieties,
    chemicals,
    fertilizers,
    units,
    regions,
    suppliers,
    isAdmin,
    loading,
    error,
    addMasterRecord,
    deleteMasterRecord
  } = useMasterData();

  const [activeTab, setActiveTab] = useState<TabKey>('varieties');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [cropForm, setCropForm] = useState({ name: '', code: '', description: '' });
  const [varietyForm, setVarietyForm] = useState({ name: '', cropId: '', code: '', notes: '' });
  const [chemicalForm, setChemicalForm] = useState({ name: '', type: '', active: '', unit: '', phi: '', rei: '' });
  const [fertilizerForm, setFertilizerForm] = useState({ name: '', ratio: '', unit: '' });
  const [unitForm, setUnitForm] = useState({ name: '', symbol: '', category: '' });
  const [regionForm, setRegionForm] = useState({ name: '', parentId: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', category: '', phone: '', email: '' });

  const cropOptions = useMemo(() => crops.filter(crop => crop.is_active !== false), [crops]);

  const resetError = () => setFormError(null);

  const handleDelete = async (table: TabKey, itemId: string) => {
    setFormSubmitting(true);
    const { error } = await deleteMasterRecord(table, itemId);
    setFormSubmitting(false);
    if (error) {
      setFormError(error);
    } else {
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAdmin) return;
    setFormError(null);
    setFormSubmitting(true);

    let result: { data: any; error: string | null } = { data: null, error: null };

    switch (activeTab) {
      case 'crops':
        if (!cropForm.name.trim()) {
          setFormError('Crop name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_crops', {
          name: cropForm.name.trim(),
          code: cropForm.code.trim() || null,
          description: cropForm.description.trim() || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setCropForm({ name: '', code: '', description: '' });
        break;
      case 'varieties':
        if (!varietyForm.name.trim()) {
          setFormError('Variety name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_varieties', {
          name: varietyForm.name.trim(),
          crop_id: varietyForm.cropId || null,
          code: varietyForm.code.trim() || null,
          notes: varietyForm.notes.trim() || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setVarietyForm({ name: '', cropId: '', code: '', notes: '' });
        break;
      case 'chemicals':
        if (!chemicalForm.name.trim()) {
          setFormError('Chemical name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_chemicals', {
          name: chemicalForm.name.trim(),
          chemical_type: chemicalForm.type.trim() || null,
          active_ingredient: chemicalForm.active.trim() || null,
          unit: chemicalForm.unit.trim() || null,
          phi_days: chemicalForm.phi ? Number(chemicalForm.phi) : null,
          rei_hours: chemicalForm.rei ? Number(chemicalForm.rei) : null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setChemicalForm({ name: '', type: '', active: '', unit: '', phi: '', rei: '' });
        break;
      case 'fertilizers':
        if (!fertilizerForm.name.trim()) {
          setFormError('Fertilizer name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_fertilizers', {
          name: fertilizerForm.name.trim(),
          nutrient_ratio: fertilizerForm.ratio.trim() || null,
          unit: fertilizerForm.unit.trim() || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setFertilizerForm({ name: '', ratio: '', unit: '' });
        break;
      case 'units':
        if (!unitForm.name.trim()) {
          setFormError('Unit name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_units', {
          name: unitForm.name.trim(),
          symbol: unitForm.symbol.trim() || null,
          category: unitForm.category.trim() || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setUnitForm({ name: '', symbol: '', category: '' });
        break;
      case 'regions':
        if (!regionForm.name.trim()) {
          setFormError('Region name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_regions', {
          name: regionForm.name.trim(),
          parent_id: regionForm.parentId || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setRegionForm({ name: '', parentId: '' });
        break;
      case 'suppliers':
        if (!supplierForm.name.trim()) {
          setFormError('Supplier name is required.');
          setFormSubmitting(false);
          return;
        }
        result = await addMasterRecord('master_suppliers', {
          name: supplierForm.name.trim(),
          category: supplierForm.category.trim() || null,
          phone: supplierForm.phone.trim() || null,
          email: supplierForm.email.trim() || null,
          is_active: true,
          version: 1,
        });
        if (!result.error) setSupplierForm({ name: '', category: '', phone: '', email: '' });
        break;
      default:
        break;
    }

    setFormSubmitting(false);
    if (result.error) setFormError(result.error);
  };

  const listData = {
    crops,
    varieties,
    chemicals,
    fertilizers,
    units,
    regions,
    suppliers,
  }[activeTab];

  const tabLabels: Record<TabKey, string> = {
    crops: 'Crops',
    varieties: 'Varieties',
    chemicals: 'Chemicals',
    fertilizers: 'Fertilizers',
    units: 'Units',
    regions: 'Regions',
    suppliers: 'Suppliers',
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
        <p className="text-red-800">Error loading master data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-green-600" />
            Master Data
          </h2>
          <p className="text-sm text-gray-600 mt-1">Central reference tables for controlled inputs.</p>
        </div>
        {!isAdmin && (
          <span className="text-xs text-gray-500">Read-only access</span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2">
        {(Object.keys(tabLabels) as TabKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              resetError();
              setActiveTab(tab);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Plus size={16} className="text-green-600" />
            Add {tabLabels[activeTab]}
          </div>

          {activeTab === 'crops' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Crop name"
                value={cropForm.name}
                onChange={event => setCropForm({ ...cropForm, name: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Code"
                value={cropForm.code}
                onChange={event => setCropForm({ ...cropForm, code: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Description"
                value={cropForm.description}
                onChange={event => setCropForm({ ...cropForm, description: event.target.value })}
              />
            </div>
          )}

          {activeTab === 'varieties' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Variety name"
                value={varietyForm.name}
                onChange={event => setVarietyForm({ ...varietyForm, name: event.target.value })}
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={varietyForm.cropId}
                onChange={event => setVarietyForm({ ...varietyForm, cropId: event.target.value })}
              >
                <option value="">Crop (optional)</option>
                {cropOptions.map(crop => (
                  <option key={crop.id} value={crop.id}>{crop.name}</option>
                ))}
              </select>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Code"
                value={varietyForm.code}
                onChange={event => setVarietyForm({ ...varietyForm, code: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Notes"
                value={varietyForm.notes}
                onChange={event => setVarietyForm({ ...varietyForm, notes: event.target.value })}
              />
            </div>
          )}

          {activeTab === 'chemicals' && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Chemical name"
                value={chemicalForm.name}
                onChange={event => setChemicalForm({ ...chemicalForm, name: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Type"
                value={chemicalForm.type}
                onChange={event => setChemicalForm({ ...chemicalForm, type: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Active ingredient"
                value={chemicalForm.active}
                onChange={event => setChemicalForm({ ...chemicalForm, active: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Unit"
                value={chemicalForm.unit}
                onChange={event => setChemicalForm({ ...chemicalForm, unit: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="PHI days"
                value={chemicalForm.phi}
                onChange={event => setChemicalForm({ ...chemicalForm, phi: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="REI hours"
                value={chemicalForm.rei}
                onChange={event => setChemicalForm({ ...chemicalForm, rei: event.target.value })}
              />
            </div>
          )}

          {activeTab === 'fertilizers' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Fertilizer name"
                value={fertilizerForm.name}
                onChange={event => setFertilizerForm({ ...fertilizerForm, name: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="N-P-K ratio"
                value={fertilizerForm.ratio}
                onChange={event => setFertilizerForm({ ...fertilizerForm, ratio: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Unit"
                value={fertilizerForm.unit}
                onChange={event => setFertilizerForm({ ...fertilizerForm, unit: event.target.value })}
              />
            </div>
          )}

          {activeTab === 'units' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Unit name"
                value={unitForm.name}
                onChange={event => setUnitForm({ ...unitForm, name: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Symbol"
                value={unitForm.symbol}
                onChange={event => setUnitForm({ ...unitForm, symbol: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Category"
                value={unitForm.category}
                onChange={event => setUnitForm({ ...unitForm, category: event.target.value })}
              />
            </div>
          )}

          {activeTab === 'regions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Region name"
                value={regionForm.name}
                onChange={event => setRegionForm({ ...regionForm, name: event.target.value })}
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={regionForm.parentId}
                onChange={event => setRegionForm({ ...regionForm, parentId: event.target.value })}
              >
                <option value="">Parent region (optional)</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Supplier name"
                value={supplierForm.name}
                onChange={event => setSupplierForm({ ...supplierForm, name: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Category"
                value={supplierForm.category}
                onChange={event => setSupplierForm({ ...supplierForm, category: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Phone"
                value={supplierForm.phone}
                onChange={event => setSupplierForm({ ...supplierForm, phone: event.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Email"
                value={supplierForm.email}
                onChange={event => setSupplierForm({ ...supplierForm, email: event.target.value })}
              />
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={formSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {formSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{tabLabels[activeTab]} ({listData.length})</h3>
          <span className="text-xs text-gray-500">Version controlled</span>
        </div>
        <div className="mt-3 space-y-2">
          {listData.length === 0 && (
            <p className="text-sm text-gray-500">No master data entries yet.</p>
          )}
          {listData.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.is_active === false ? 'Inactive' : 'Active'}
                  </span>
                  {isAdmin && (
                    deleteConfirm === item.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(activeTab, item.id)}
                          disabled={formSubmitting}
                          className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={formSubmitting}
                          className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Version {item.version || 1} • Valid from {item.valid_from || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
