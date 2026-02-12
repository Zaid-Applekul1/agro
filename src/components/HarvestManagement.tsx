import { useEffect, useState } from 'react';
import { useHarvest } from '../hooks/useHarvest';
import { useTrees } from '../hooks/useTrees';
import { useOrchards } from '../hooks/useOrchards';
import { useFields } from '../hooks/useFields';
import { useInventory } from '../hooks/useInventory';
import { useFinances } from '../hooks/useFinances';
import { appleVarieties } from '../data/mockData';
import { Apple, Plus, TrendingUp, Package, Star, Thermometer, Calendar, MapPin, Sprout, Box, PoundSterling } from 'lucide-react';

export function HarvestManagement() {
  const { harvest, loading: harvestLoading, error: harvestError, updateHarvestRecord, addHarvestRecord } = useHarvest();
  const { trees, loading: treesLoading } = useTrees();
  const { orchards, treePoints, loading: orchardsLoading } = useOrchards();
  const { fields, loading: fieldsLoading } = useFields();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { finances, loading: financesLoading } = useFinances();
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<(typeof harvest)[number] | null>(null);
  const [updateForm, setUpdateForm] = useState({
    picker: '',
    binCount: '',
    qualityGrade: 'standard',
    pricePerBin: '',
    harvestDate: '',
    storageLocation: '',
    shelfLifeDays: '',
    containerType: 'bin',
    containerCapacity: '20',
    transportVehicle: '',
  });
  const [formTreeId, setFormTreeId] = useState('');
  const [formPicker, setFormPicker] = useState('');
  const [formBinCount, setFormBinCount] = useState('');
  const [formQualityGrade, setFormQualityGrade] = useState('standard');
  const [formPricePerBin, setFormPricePerBin] = useState('');
  const [formHarvestDate, setFormHarvestDate] = useState('');
  const [formStorageLocation, setFormStorageLocation] = useState('');
  const [formShelfLifeDays, setFormShelfLifeDays] = useState('');
  const [formContainerType, setFormContainerType] = useState('bin');
  const [formContainerCapacity, setFormContainerCapacity] = useState('20');
  const [formTransportVehicle, setFormTransportVehicle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const containerTypes = [
    { value: 'bin', label: 'Bin (standard)' },
    { value: 'crate', label: 'Crate (kg)' }
  ];

  const containerCapacities = {
    crate: ['15', '20', '25', '30'],
    bin: ['10', '15', '20', '25', '30']
  };

  useEffect(() => {
    if (!selectedRecord) return;
    setUpdateForm({
      picker: selectedRecord.picker || '',
      binCount: selectedRecord.bin_count?.toString() || '',
      qualityGrade: selectedRecord.quality_grade || 'standard',
      pricePerBin: selectedRecord.price_per_bin?.toString() || '',
      harvestDate: selectedRecord.harvest_date || '',
      storageLocation: selectedRecord.storage_location || '',
      shelfLifeDays: selectedRecord.shelf_life_days?.toString() || '',
      containerType: selectedRecord.container_type || 'bin',
      containerCapacity: selectedRecord.container_capacity || '',
      transportVehicle: selectedRecord.transport_vehicle || '',
    });
  }, [selectedRecord]);

  const loading = harvestLoading || treesLoading || orchardsLoading;

  const filteredHarvest = selectedVariety === 'all' 
    ? harvest 
    : harvest.filter(h => h.variety === selectedVariety);

  const totalBins = filteredHarvest.reduce((sum, h) => sum + (h.bin_count || 0), 0);
  const totalRevenue = filteredHarvest.reduce((sum, h) => sum + (h.total_revenue || 0), 0);
  const avgPricePerBin = totalBins > 0 ? totalRevenue / totalBins : 0;
  const premiumGrade = filteredHarvest.filter(h => h.quality_grade === 'premium').length;
  
  const totalOrchardTrees = orchards.reduce((sum, o) => sum + (o.tree_count || 0), 0);
  const totalTreeBlocks = trees.reduce((sum, t) => sum + (t.tree_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (harvestError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading harvest data: {harvestError}</p>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'export': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'premium': return 'bg-gold-100 text-yellow-800 border-yellow-300';
      case 'standard': return 'bg-green-100 text-green-800 border-green-300';
      case 'processing': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'reject': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVarietyInfo = (variety: string) => {
    return appleVarieties.find(v => v.name === variety);
  };

  const openUpdateForm = (record: (typeof harvest)[number]) => {
    setSelectedRecord(record);
    setUpdateForm({
      picker: record.picker || '',
      binCount: record.bin_count?.toString() || '',
      qualityGrade: record.quality_grade || 'standard',
      pricePerBin: record.price_per_bin?.toString() || '',
      harvestDate: record.harvest_date || '',
      storageLocation: record.storage_location || '',
      shelfLifeDays: record.shelf_life_days?.toString() || '',
      containerType: (record as any).container_type || 'bin',
      containerCapacity: (record as any).container_capacity || '20',
      transportVehicle: (record as any).transport_vehicle || '',
    });
    setShowUpdateForm(true);
  };

  const openAddForm = () => {
    const firstTree = trees[0];
    setFormTreeId(firstTree?.id || '');
    setFormPicker('');
    setFormBinCount('');
    setFormQualityGrade('standard');
    setFormPricePerBin('');
    setFormHarvestDate('');
    setFormStorageLocation('Cold Storage A');
    setFormShelfLifeDays('');
    setFormContainerType('bin');
    setFormContainerCapacity('20');
    setFormTransportVehicle('');
    setFormError(null);
    setShowAddForm(true);
  };

  const handlePrintLabel = (record: (typeof harvest)[number]) => {
    const label = [
      'AppleKul Farm - Harvest Label',
      `Variety: ${record.variety}`,
      `Picker: ${record.picker}`,
      `Bins: ${record.bin_count}`,
      `Harvest Date: ${new Date(record.harvest_date).toLocaleDateString()}`,
      record.storage_location ? `Storage: ${record.storage_location}` : null,
    ].filter(Boolean).join('\n');

    const blob = new Blob([label], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `harvest-label-${record.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Harvest Management</h2>
          <p className="text-gray-600 mt-1">Track apple harvest, quality grading, and storage</p>
        </div>
        <button 
          onClick={openAddForm}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Record Harvest</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Total Bins</p>
              <p className="text-2xl font-bold text-green-800">{totalBins}</p>
              <p className="text-xs text-green-600 mt-1">This season</p>
            </div>
            <Package className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-800">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">From harvest sales</p>
            </div>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div>
            <p className="text-purple-700 font-medium">Avg Price/Bin</p>
            <p className="text-2xl font-bold text-purple-800">₹{Math.round(avgPricePerBin)}</p>
            <p className="text-xs text-purple-600 mt-1">Market rate</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-medium">Premium Grade</p>
              <p className="text-2xl font-bold text-yellow-800">{premiumGrade}</p>
              <p className="text-xs text-yellow-600 mt-1">High quality batches</p>
            </div>
            <Star className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      {/* Orchard Integration Stats */}
      {orchards.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-green-600" size={20} />
                <h3 className="font-semibold text-gray-900">Orchard System Integration</h3>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-3">
                <div>
                  <p className="text-xs text-gray-600">Mapped Orchards</p>
                  <p className="text-lg font-bold text-green-700">{orchards.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">GPS-Tagged Trees</p>
                  <p className="text-lg font-bold text-blue-700">{totalOrchardTrees}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tree Block Count</p>
                  <p className="text-lg font-bold text-purple-700">{totalTreeBlocks}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Coverage</p>
              <p className="text-2xl font-bold text-green-600">
                {totalTreeBlocks > 0 ? Math.round((totalOrchardTrees / totalTreeBlocks) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Trees mapped</p>
            </div>
          </div>
        </div>
      )}

      {/* Variety Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Filter by Variety:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedVariety('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedVariety === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Varieties
            </button>
            {Array.from(new Set(harvest.map(h => h.variety))).map(variety => (
              <button
                key={variety}
                onClick={() => setSelectedVariety(variety)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedVariety === variety ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {variety}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Harvest Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHarvest.map(record => (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Apple size={20} className="text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{record.variety}</h3>
                    <p className="text-sm text-gray-600">Harvested by {record.picker}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full font-medium border ${getGradeColor(record.quality_grade || 'standard')}`}>
                  {record.quality_grade}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">Bins Harvested</p>
                  <p className="text-xl font-bold text-gray-900">{record.bin_count}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Revenue</p>
                  <p className="text-xl font-bold text-green-600">₹{record.total_revenue?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Price per Bin</p>
                  <p className="text-lg font-medium text-gray-900">₹{record.price_per_bin}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Harvest Date</p>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} className="text-gray-400" />
                    <p className="text-sm text-gray-700">{new Date(record.harvest_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {record.storage_location && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Storage: {record.storage_location}</p>
                    </div>
                    {record.shelf_life_days && (
                      <div className="flex items-center space-x-1">
                        <Thermometer size={14} className="text-blue-600" />
                        <span className="text-sm text-blue-800">{record.shelf_life_days} days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => openUpdateForm(record)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Record
                </button>
                <button
                  onClick={() => handlePrintLabel(record)}
                  className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Print Label
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Variety Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variety Performance This Season</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bins</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(new Set(harvest.map(h => h.variety))).map(variety => {
                const varietyHarvests = harvest.filter(h => h.variety === variety);
                const totalBins = varietyHarvests.reduce((sum, h) => sum + (h.bin_count || 0), 0);
                const totalRevenue = varietyHarvests.reduce((sum, h) => sum + (h.total_revenue || 0), 0);
                const avgPrice = totalBins > 0 ? totalRevenue / totalBins : 0;
                const premiumCount = varietyHarvests.filter(h => h.quality_grade === 'premium').length;
                const premiumPercent = varietyHarvests.length > 0 ? (premiumCount / varietyHarvests.length) * 100 : 0;
                const varietyInfo = getVarietyInfo(variety);
                
                return (
                  <tr key={variety} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{variety}</td>
                    <td className="px-4 py-4 text-gray-900">{totalBins}</td>
                    <td className="px-4 py-4 font-medium text-green-600">₹{totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-4 text-gray-900">₹{Math.round(avgPrice)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        premiumPercent >= 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {Math.round(premiumPercent)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        varietyInfo?.marketDemand === 'high' ? 'bg-green-100 text-green-800' : 
                        varietyInfo?.marketDemand === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {varietyInfo?.marketDemand || 'unknown'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Harvest Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Record New Harvest</h3>
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

                  if (!formTreeId || !formPicker.trim() || !formBinCount || !formHarvestDate) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  const tree = trees.find(t => t.id === formTreeId);
                  const binCount = Number(formBinCount || 0);
                  const pricePerBin = Number(formPricePerBin || 0);
                  const totalRevenue = binCount * pricePerBin;

                  setFormSubmitting(true);
                  const { error: submitError } = await addHarvestRecord({
                    tree_id: formTreeId,
                    variety: tree?.variety || 'Unknown',
                    picker: formPicker.trim(),
                    bin_count: binCount,
                    quality_grade: formQualityGrade,
                    price_per_bin: pricePerBin,
                    total_revenue: totalRevenue,
                    harvest_date: formHarvestDate,
                    storage_location: formStorageLocation || null,
                    shelf_life_days: formShelfLifeDays ? Number(formShelfLifeDays) : null,
                    container_type: formContainerType,
                    container_capacity: formContainerCapacity,
                    transport_vehicle: formTransportVehicle.trim() || null,
                  } as any);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Picker Name</label>
                    <input
                      type="text"
                      value={formPicker}
                      onChange={event => setFormPicker(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bins Harvested</label>
                    <input
                      type="number"
                      value={formBinCount}
                      onChange={event => setFormBinCount(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                    <select
                      value={formQualityGrade}
                      onChange={event => setFormQualityGrade(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="export">Export</option>
                      <option value="premium">Premium</option>
                      <option value="standard">Standard</option>
                      <option value="processing">Processing</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Bin (₹)</label>
                    <input
                      type="number"
                      value={formPricePerBin}
                      onChange={event => setFormPricePerBin(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      value={formHarvestDate}
                      onChange={event => setFormHarvestDate(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                    <select
                      value={formStorageLocation}
                      onChange={event => setFormStorageLocation(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select storage</option>
                      <option value="Cold Storage A">Cold Storage A</option>
                      <option value="Cold Storage B">Cold Storage B</option>
                      <option value="Cold Storage C">Cold Storage C</option>
                      <option value="Ambient Storage">Ambient Storage</option>
                      <option value="Controlled Atmosphere">Controlled Atmosphere</option>
                      <option value="Packing House">Packing House</option>
                      <option value="On-Farm Storage">On-Farm Storage</option>
                      <option value="Direct Sale">Direct Sale</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Shelf Life (Days - Optional)</label>
                  <input
                    type="number"
                    value={formShelfLifeDays}
                    onChange={event => setFormShelfLifeDays(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Container Type</label>
                    <select
                      value={formContainerType}
                      onChange={event => {
                        setFormContainerType(event.target.value);
                        setFormContainerCapacity(event.target.value === 'crate' ? '20' : '20');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {containerTypes.map(ct => (
                        <option key={ct.value} value={ct.value}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formContainerType === 'crate' ? 'Capacity (kg)' : 'Capacity'}
                    </label>
                    <select
                      value={formContainerCapacity}
                      onChange={event => setFormContainerCapacity(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {containerCapacities[formContainerType as keyof typeof containerCapacities].map(size => (
                        <option key={size} value={size}>
                          {size} {formContainerType === 'crate' ? 'kg' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Vehicle</label>
                    <input
                      type="text"
                      value={formTransportVehicle}
                      onChange={event => setFormTransportVehicle(event.target.value)}
                      placeholder="e.g., DL-01-AB-1234"
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
                    {formSubmitting ? 'Saving...' : 'Record Harvest'}
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

      {showUpdateForm && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Harvest Record</h3>
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
                  const binCount = Number(updateForm.binCount || 0);
                  const pricePerBin = Number(updateForm.pricePerBin || 0);
                  const totalRevenue = binCount * pricePerBin;

                  await updateHarvestRecord(selectedRecord.id, {
                    picker: updateForm.picker.trim(),
                    bin_count: binCount,
                    price_per_bin: pricePerBin,
                    total_revenue: totalRevenue,
                    quality_grade: updateForm.qualityGrade,
                    harvest_date: updateForm.harvestDate,
                    storage_location: updateForm.storageLocation || null,
                    shelf_life_days: updateForm.shelfLifeDays ? Number(updateForm.shelfLifeDays) : null,
                    container_type: updateForm.containerType || null,
                    container_capacity: updateForm.containerCapacity || null,
                    transport_vehicle: updateForm.transportVehicle?.trim() || null,
                  } as any);
                  setShowUpdateForm(false);
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Picker Name</label>
                    <input
                      type="text"
                      value={updateForm.picker}
                      onChange={event => setUpdateForm({ ...updateForm, picker: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      value={updateForm.harvestDate}
                      onChange={event => setUpdateForm({ ...updateForm, harvestDate: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bins Harvested</label>
                    <input
                      type="number"
                      value={updateForm.binCount}
                      onChange={event => setUpdateForm({ ...updateForm, binCount: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Bin (₹)</label>
                    <input
                      type="number"
                      value={updateForm.pricePerBin}
                      onChange={event => setUpdateForm({ ...updateForm, pricePerBin: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                    <select
                      value={updateForm.qualityGrade}
                      onChange={event => setUpdateForm({ ...updateForm, qualityGrade: event.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="export">Export</option>
                      <option value="premium">Premium</option>
                      <option value="standard">Standard</option>
                      <option value="processing">Processing</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                </div>

                  <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                    <select
                      value={updateForm.storageLocation}
                      onChange={event => setUpdateForm({ ...updateForm, storageLocation: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select storage</option>
                      <option value="Cold Storage A">Cold Storage A</option>
                      <option value="Cold Storage B">Cold Storage B</option>
                      <option value="Cold Storage C">Cold Storage C</option>
                      <option value="Ambient Storage">Ambient Storage</option>
                      <option value="Controlled Atmosphere">Controlled Atmosphere</option>
                      <option value="Packing House">Packing House</option>
                      <option value="On-Farm Storage">On-Farm Storage</option>
                      <option value="Direct Sale">Direct Sale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life (Days - Optional)</label>
                  <input
                    type="number"
                    value={updateForm.shelfLifeDays}
                    onChange={event => setUpdateForm({ ...updateForm, shelfLifeDays: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Container Type</label>
                    <select
                      value={updateForm.containerType}
                      onChange={event => setUpdateForm({ ...updateForm, containerType: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {containerTypes.map(ct => (
                        <option key={ct.value} value={ct.value}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {updateForm.containerType === 'crate' ? 'Capacity (kg)' : 'Capacity'}
                    </label>
                    <select
                      value={updateForm.containerCapacity}
                      onChange={event => setUpdateForm({ ...updateForm, containerCapacity: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {containerCapacities[updateForm.containerType as keyof typeof containerCapacities].map(size => (
                        <option key={size} value={size}>
                          {size} {updateForm.containerType === 'crate' ? 'kg' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Vehicle</label>
                    <input
                      type="text"
                      value={updateForm.transportVehicle}
                      onChange={event => setUpdateForm({ ...updateForm, transportVehicle: event.target.value })}
                      placeholder="e.g., DL-01-AB-1234"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
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
    </div>
  );
}