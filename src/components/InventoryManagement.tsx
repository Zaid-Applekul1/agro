import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useHarvest } from '../hooks/useHarvest';
import { useFinances } from '../hooks/useFinances';
import { StorageTracking } from './StorageTracking';
import { Package, AlertTriangle, Plus, Search, Bug, Apple, PoundSterling } from 'lucide-react';

export function InventoryManagement() {
  const { inventory, loading, error, addInventoryItem } = useInventory();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { finances, loading: finLoading } = useFinances();
  const [activeTab, setActiveTab] = useState<'materials' | 'storage'>('materials');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('fertilizer');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formPrice, setFormPrice] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

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
        <p className="text-red-800">Error loading inventory: {error}</p>
      </div>
    );
  }

  const filteredInventory = inventory.filter(item => {
    const matchesType = selectedType === 'all' || item.item_type === selectedType;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'fertilizer': return 'bg-green-100 text-green-800';
      case 'pesticide': return 'bg-red-100 text-red-800';
      case 'seed': return 'bg-amber-100 text-amber-800';
      case 'fuel': return 'bg-yellow-100 text-yellow-800';
      case 'tool': return 'bg-blue-100 text-blue-800';
      case 'packaging': return 'bg-purple-100 text-purple-800';
      case 'spare_parts': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const lowStockItems = inventory.filter(item => (item.quantity || 0) < 100);
  const expiringItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  });

  const totalValue = filteredInventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price_per_unit || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory & Storage</h2>
          <p className="text-sm text-gray-600 mt-1">Manage materials plus warehouse and CA storage</p>
        </div>
        {activeTab === 'materials' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'materials' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Materials Inventory
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'storage' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Warehouse & CA Tracking
          </button>
        </div>
      </div>

      {activeTab === 'storage' && <StorageTracking />}

      {activeTab === 'materials' && (
        <>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-800">{filteredInventory.length}</p>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium text-sm">Pest Products Used</p>
              <p className="text-2xl font-bold text-red-800">{pestTreatments.length}</p>
            </div>
            <Bug className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div>
            <p className="text-green-700 font-medium">Total Value</p>
            <p className="text-2xl font-bold text-green-800">₹{totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className={`${lowStockItems.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${lowStockItems.length > 0 ? 'text-amber-700' : 'text-green-700'} font-medium`}>Low Stock</p>
              <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                {lowStockItems.length}
              </p>
            </div>
            {lowStockItems.length > 0 && <AlertTriangle className="text-amber-600" size={24} />}
          </div>
        </div>

        <div className={`${expiringItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${expiringItems.length > 0 ? 'text-red-700' : 'text-green-700'} font-medium`}>Expiring Soon</p>
              <p className={`text-2xl font-bold ${expiringItems.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                {expiringItems.length}
              </p>
            </div>
            {expiringItems.length > 0 && <AlertTriangle className="text-red-600" size={24} />}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {['all', 'fertilizer', 'pesticide', 'seed', 'fuel', 'tool', 'packaging', 'spare_parts'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-amber-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">Inventory Alerts</h3>
              <div className="mt-2 text-sm text-amber-700">
                {lowStockItems.length > 0 && (
                  <p>• {lowStockItems.length} items are running low on stock</p>
                )}
                {expiringItems.length > 0 && (
                  <p>• {expiringItems.length} items are expiring within 3 months</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Stock</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.expiry_date && (
                        <div className="text-sm text-gray-500">Expires: {new Date(item.expiry_date).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeClasses(item.item_type)}`}>
                        {item.item_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4 text-gray-900">₹{item.price_per_unit?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{((item.quantity || 0) * (item.price_per_unit || 0)).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-900">{item.supplier}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {(item.quantity || 0) < 100 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                            Low Stock
                          </span>
                        )}
                        {item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Expiring Soon
                          </span>
                        )}
                        {(item.quantity || 0) >= 100 && (!item.expiry_date || new Date(item.expiry_date) > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Good
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Inventory Item</h3>
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

                  if (!formName.trim() || !formQuantity || !formPrice || !formSupplier.trim()) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addInventoryItem({
                    name: formName.trim(),
                    item_type: formType,
                    quantity: Number(formQuantity),
                    unit: formUnit.trim(),
                    price_per_unit: Number(formPrice),
                    supplier: formSupplier.trim(),
                    expiry_date: formExpiry || null,
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setFormName('');
                  setFormType('fertilizer');
                  setFormQuantity('');
                  setFormUnit('kg');
                  setFormPrice('');
                  setFormSupplier('');
                  setFormExpiry('');
                  setShowAddForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={event => setFormName(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={event => setFormType(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="fertilizer">Fertilizer</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="seed">Seed</option>
                      <option value="fuel">Fuel</option>
                      <option value="tool">Tool</option>
                      <option value="packaging">Packaging</option>
                      <option value="spare_parts">Spare Parts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={event => setFormUnit(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formQuantity}
                      onChange={event => setFormQuantity(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={event => setFormPrice(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={event => setFormSupplier(event.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={event => setFormExpiry(event.target.value)}
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
                    {formSubmitting ? 'Saving...' : 'Add Item'}
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
        </>
      )}
    </div>
  );
}