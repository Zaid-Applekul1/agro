import { useState, useMemo, FormEvent } from 'react';
import { useNursery } from '../hooks/useNursery';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useFinances } from '../hooks/useFinances';
import {
  Sprout,
  Plus,
  Store,
  Package,
  Skull,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  X,
} from 'lucide-react';

export function NurseryManagement() {
  const { suppliers, batches, mortality, loading, error, addSupplier, addBatch, addMortality, updateBatch, deleteMortality } = useNursery();
  const { fields } = useFields();
  const { trees } = useTrees();
  const { addFinancialEntry } = useFinances();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'batches' | 'mortality'>('batches');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showMortalityForm, setShowMortalityForm] = useState(false);
  const [openBatchMenuId, setOpenBatchMenuId] = useState<string | null>(null);
  const [openMortalityMenuId, setOpenMortalityMenuId] = useState<string | null>(null);

  const [filterSupplierId, setFilterSupplierId] = useState('');
  const [filterFieldId, setFilterFieldId] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Supplier form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    certification: '',
    rating: 5,
    notes: '',
  });

  // Batch form state
  const [batchForm, setBatchForm] = useState({
    supplierId: '',
    fieldId: '',
    treeBlockId: '',
    batchNumber: '',
    variety: '',
    rootstockType: '',
    graftMethod: '',
    quantity: '',
    costPerPlant: '',
    purchaseDate: '',
    plantingDate: '',
    plantedCount: '',
    sourceLocation: '',
    certificationNumber: '',
    notes: '',
  });

  // Mortality form state
  const [mortalityForm, setMortalityForm] = useState({
    fieldId: '',
    treeBlockId: '',
    nurseryBatchId: '',
    treeIdentifier: '',
    variety: '',
    causeOfDeath: 'disease' as const,
    deathDate: '',
    treeAgeMonths: '',
    replaced: false,
    replacementBatchId: '',
    replacementDate: '',
    replacementCost: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Calculate statistics
  const totalPlants = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalInvestment = batches.reduce((sum, b) => sum + (b.total_cost || 0), 0);
  const totalPlanted = batches.reduce((sum, b) => sum + (b.planted_count || 0), 0);
  const totalDead = mortality.length;
  const totalReplaced = mortality.filter(m => m.replaced).length;
  const averageSurvivalRate = batches.length > 0
    ? batches.reduce((sum, b) => sum + (b.survival_rate || 0), 0) / batches.length
    : 0;
  const replacementCost = mortality.reduce((sum, m) => sum + (m.replacement_cost || 0), 0);

  // Mortality by cause
  const mortalityByCause = useMemo(() => {
    const counts: Record<string, number> = {};
    mortality.forEach(m => {
      counts[m.cause_of_death] = (counts[m.cause_of_death] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [mortality]);

  const batchById = useMemo(() => {
    return batches.reduce<Record<string, typeof batches[number]>>((acc, batch) => {
      acc[batch.id] = batch;
      return acc;
    }, {});
  }, [batches]);

  const varietyOptions = useMemo(() => {
    const varieties = new Set<string>();
    batches.forEach(batch => varieties.add(batch.variety));
    mortality.forEach(record => varieties.add(record.variety));
    return Array.from(varieties).sort();
  }, [batches, mortality]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      if (filterSupplierId && batch.supplier_id !== filterSupplierId) return false;
      if (filterFieldId && batch.field_id !== filterFieldId) return false;
      if (filterVariety && batch.variety !== filterVariety) return false;
      if (filterStartDate && batch.purchase_date < filterStartDate) return false;
      if (filterEndDate && batch.purchase_date > filterEndDate) return false;
      return true;
    });
  }, [batches, filterSupplierId, filterFieldId, filterVariety, filterStartDate, filterEndDate]);

  const filteredMortality = useMemo(() => {
    return mortality.filter(record => {
      if (filterFieldId && record.field_id !== filterFieldId) return false;
      if (filterVariety && record.variety !== filterVariety) return false;
      if (filterStartDate && record.death_date < filterStartDate) return false;
      if (filterEndDate && record.death_date > filterEndDate) return false;
      if (filterSupplierId) {
        const batch = record.nursery_batch_id ? batchById[record.nursery_batch_id] : null;
        if (!batch || batch.supplier_id !== filterSupplierId) return false;
      }
      return true;
    });
  }, [mortality, filterSupplierId, filterFieldId, filterVariety, filterStartDate, filterEndDate, batchById]);

  const clearFilters = () => {
    setFilterSupplierId('');
    setFilterFieldId('');
    setFilterVariety('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleSupplierSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      setFormError('Supplier name is required');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const result = await addSupplier({
      name: supplierForm.name.trim(),
      contact_person: supplierForm.contactPerson.trim() || null,
      phone: supplierForm.phone.trim() || null,
      email: supplierForm.email.trim() || null,
      address: supplierForm.address.trim() || null,
      certification: supplierForm.certification.trim() || null,
      rating: supplierForm.rating,
      notes: supplierForm.notes.trim() || null,
    });

    setFormSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setSupplierForm({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      certification: '',
      rating: 5,
      notes: '',
    });
    setShowSupplierForm(false);
  };

  const handleBatchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchNumber.trim() || !batchForm.variety.trim() || !batchForm.rootstockType.trim()) {
      setFormError('Batch number, variety, and rootstock type are required');
      return;
    }

    const quantity = parseInt(batchForm.quantity);
    const costPerPlant = parseFloat(batchForm.costPerPlant);
    const plantedCount = batchForm.plantedCount ? parseInt(batchForm.plantedCount) : 0;

    if (isNaN(quantity) || quantity <= 0) {
      setFormError('Quantity must be a positive number');
      return;
    }
    if (isNaN(costPerPlant) || costPerPlant <= 0) {
      setFormError('Cost per plant must be a positive number');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const totalCost = quantity * costPerPlant;
    const survivedCount = plantedCount;
    const survivalRate = plantedCount > 0 ? (survivedCount / plantedCount * 100) : 0;
    try {
      const result = await addBatch({
        supplier_id: batchForm.supplierId || null,
        field_id: batchForm.fieldId || null,
        tree_block_id: batchForm.treeBlockId || null,
        batch_number: batchForm.batchNumber.trim(),
        variety: batchForm.variety.trim(),
        rootstock_type: batchForm.rootstockType.trim(),
        graft_method: batchForm.graftMethod.trim() || null,
        quantity,
        cost_per_plant: costPerPlant,
        total_cost: totalCost,
        purchase_date: batchForm.purchaseDate,
        planting_date: batchForm.plantingDate || null,
        planted_count: plantedCount,
        survived_count: survivedCount,
        mortality_count: 0,
        survival_rate: Number(survivalRate.toFixed(2)),
        source_location: batchForm.sourceLocation.trim() || null,
        certification_number: batchForm.certificationNumber.trim() || null,
        notes: batchForm.notes.trim() || null,
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      try {
        // Add to financial ledger as expense
        await addFinancialEntry({
          entry_type: 'expense',
          category: 'inputs',
          amount: totalCost,
          description: `Nursery batch ${batchForm.batchNumber} - ${quantity} ${batchForm.variety} plants`,
          entry_date: batchForm.purchaseDate,
        });
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to add finance entry');
      }

      setBatchForm({
        supplierId: '',
        fieldId: '',
        treeBlockId: '',
        batchNumber: '',
        variety: '',
        rootstockType: '',
        graftMethod: '',
        quantity: '',
        costPerPlant: '',
        purchaseDate: '',
        plantingDate: '',
        plantedCount: '',
        sourceLocation: '',
        certificationNumber: '',
        notes: '',
      });
      setShowBatchForm(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMortalitySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!mortalityForm.variety.trim() || !mortalityForm.deathDate) {
      setFormError('Variety and death date are required');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const result = await addMortality({
      field_id: mortalityForm.fieldId || null,
      tree_block_id: mortalityForm.treeBlockId || null,
      nursery_batch_id: mortalityForm.nurseryBatchId || null,
      orchard_id: null,
      tree_identifier: mortalityForm.treeIdentifier.trim() || null,
      variety: mortalityForm.variety.trim(),
      cause_of_death: mortalityForm.causeOfDeath,
      death_date: mortalityForm.deathDate,
      tree_age_months: mortalityForm.treeAgeMonths ? parseInt(mortalityForm.treeAgeMonths) : null,
      replaced: mortalityForm.replaced,
      replacement_batch_id: mortalityForm.replacementBatchId || null,
      replacement_date: mortalityForm.replacementDate || null,
      replacement_cost: mortalityForm.replacementCost ? parseFloat(mortalityForm.replacementCost) : null,
      notes: mortalityForm.notes.trim() || null,
    });

    if (result.error) {
      setFormSubmitting(false);
      setFormError(result.error);
      return;
    }

    // If replacement cost is provided, add to financial ledger
    if (mortalityForm.replacementCost && parseFloat(mortalityForm.replacementCost) > 0) {
      await addFinancialEntry({
        entry_type: 'expense',
        category: 'inputs',
        amount: parseFloat(mortalityForm.replacementCost),
        description: `Tree replacement - ${mortalityForm.variety}`,
        entry_date: mortalityForm.replacementDate || mortalityForm.deathDate,
      });
    }

    setFormSubmitting(false);

    setMortalityForm({
      fieldId: '',
      treeBlockId: '',
      nurseryBatchId: '',
      treeIdentifier: '',
      variety: '',
      causeOfDeath: 'disease',
      deathDate: '',
      treeAgeMonths: '',
      replaced: false,
      replacementBatchId: '',
      replacementDate: '',
      replacementCost: '',
      notes: '',
    });
    setShowMortalityForm(false);
  };

  const availableTreeBlocks = useMemo(() => {
    if (!batchForm.fieldId && !mortalityForm.fieldId) return trees;
    const fieldId = batchForm.fieldId || mortalityForm.fieldId;
    return trees.filter(t => t.field_id === fieldId);
  }, [trees, batchForm.fieldId, mortalityForm.fieldId]);

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
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sprout className="text-green-600" />
            Nursery & Plant Material Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Track nursery stock, suppliers, and tree mortality</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
            <select
              value={filterSupplierId}
              onChange={e => setFilterSupplierId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
            <select
              value={filterFieldId}
              onChange={e => setFilterFieldId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All fields</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Variety</label>
            <select
              value={filterVariety}
              onChange={e => setFilterVariety(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All varieties</option>
              {varietyOptions.map(variety => (
                <option key={variety} value={variety}>{variety}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-lg"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <Package className="text-blue-600" size={24} />
            <TrendingUp className="text-blue-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{totalPlants.toLocaleString()}</p>
          <p className="text-xs text-blue-700 font-medium">Total Plants Purchased</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <Sprout className="text-green-600" size={24} />
            <CheckCircle className="text-green-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{totalPlanted.toLocaleString()}</p>
          <p className="text-xs text-green-700 font-medium">Trees Planted</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="text-purple-600" size={24} />
            <span className="text-xs text-purple-700 font-bold">{averageSurvivalRate.toFixed(1)}%</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{averageSurvivalRate.toFixed(0)}%</p>
          <p className="text-xs text-purple-700 font-medium">Avg Survival Rate</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <Skull className="text-red-600" size={24} />
            <AlertTriangle className="text-red-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">{totalDead}</p>
          <p className="text-xs text-red-700 font-medium">Dead Trees</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="text-yellow-600" size={24} />
            <TrendingUp className="text-yellow-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">₹{totalInvestment.toLocaleString()}</p>
          <p className="text-xs text-yellow-700 font-medium">Total Investment</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="text-orange-600" size={24} />
            <XCircle className="text-orange-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-2">₹{replacementCost.toLocaleString()}</p>
          <p className="text-xs text-orange-700 font-medium">Replacement Cost</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('batches')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'batches'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={18} />
              Plant Batches ({batches.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'suppliers'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Store size={18} />
              Suppliers ({suppliers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('mortality')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'mortality'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Skull size={18} />
              Mortality Records ({mortality.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Plant Batches</h3>
            <button
              onClick={() => setShowBatchForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              Add Batch
            </button>
          </div>

          {filteredBatches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Package className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">No nursery batches recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">Start tracking your plant purchases and survival rates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBatches.map(batch => {
                const supplier = suppliers.find(s => s.id === batch.supplier_id);
                const field = fields.find(f => f.id === batch.field_id);
                const treeBlock = trees.find(t => t.id === batch.tree_block_id);
                
                return (
                  <div key={batch.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{batch.batch_number}</h4>
                        <p className="text-sm text-gray-600">{batch.variety} on {batch.rootstock_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          (batch.survival_rate ?? 0) >= 90 ? 'bg-green-100 text-green-700' :
                          (batch.survival_rate ?? 0) >= 75 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {batch.survival_rate ?? 0}% survival
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenBatchMenuId(openBatchMenuId === batch.id ? null : batch.id)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Options"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openBatchMenuId === batch.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  if (batch.supplier_id) setFilterSupplierId(batch.supplier_id);
                                  setOpenBatchMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                Filter by supplier
                              </button>
                              <button
                                onClick={() => {
                                  if (batch.field_id) setFilterFieldId(batch.field_id);
                                  setOpenBatchMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                Filter by field
                              </button>
                              <button
                                onClick={() => {
                                  setFilterVariety(batch.variety);
                                  setOpenBatchMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                Filter by variety
                              </button>
                              <button
                                onClick={() => {
                                  clearFilters();
                                  setOpenBatchMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                Clear filters
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{batch.quantity} plants</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Planted:</span>
                        <span className="font-medium">{batch.planted_count || 0} / {batch.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Survived:</span>
                        <span className="font-medium text-green-600">{batch.survived_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mortality:</span>
                        <span className="font-medium text-red-600">{batch.mortality_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per plant:</span>
                        <span className="font-medium">₹{batch.cost_per_plant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total cost:</span>
                        <span className="font-bold text-gray-900">₹{batch.total_cost}</span>
                      </div>
                      {supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-medium text-blue-600">{supplier.name}</span>
                        </div>
                      )}
                      {field && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Field:</span>
                          <span className="font-medium text-green-600">{field.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Purchase date:</span>
                        <span className="font-medium">{new Date(batch.purchase_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Nursery Suppliers</h3>
            <button
              onClick={() => setShowSupplierForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              Add Supplier
            </button>
          </div>

          {suppliers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Store className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">No suppliers recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">Add nursery suppliers to track plant sources</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{supplier.name}</h4>
                      {supplier.contact_person && (
                        <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                      )}
                    </div>
                    {supplier.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-semibold">{supplier.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {supplier.phone && (
                      <p className="text-gray-600">📞 {supplier.phone}</p>
                    )}
                    {supplier.email && (
                      <p className="text-gray-600">📧 {supplier.email}</p>
                    )}
                    {supplier.certification && (
                      <p className="text-green-600 font-medium">✓ {supplier.certification}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mortality' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tree Mortality Records</h3>
              {mortalityByCause.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Top cause: <span className="font-semibold">{mortalityByCause[0][0]}</span> ({mortalityByCause[0][1]} trees)
                </p>
              )}
            </div>
            <button
              onClick={() => setShowMortalityForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={18} />
              Record Mortality
            </button>
          </div>

          {filteredMortality.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Skull className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">No mortality records yet</p>
              <p className="text-sm text-gray-500 mt-1">Track dead trees and replacement costs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMortality.map(record => {
                const field = fields.find(f => f.id === record.field_id);
                const batch = batches.find(b => b.id === record.nursery_batch_id);
                
                return (
                  <div key={record.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{record.variety}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            record.replaced ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {record.replaced ? '✓ Replaced' : 'Not replaced'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                            {record.cause_of_death.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Death date:</span>
                            <p className="font-medium">{new Date(record.death_date).toLocaleDateString()}</p>
                          </div>
                          {record.tree_age_months && (
                            <div>
                              <span className="text-gray-600">Age:</span>
                              <p className="font-medium">{record.tree_age_months} months</p>
                            </div>
                          )}
                          {field && (
                            <div>
                              <span className="text-gray-600">Field:</span>
                              <p className="font-medium text-green-600">{field.name}</p>
                            </div>
                          )}
                          {record.replacement_cost && (
                            <div>
                              <span className="text-gray-600">Replacement cost:</span>
                              <p className="font-bold text-orange-600">₹{record.replacement_cost}</p>
                            </div>
                          )}
                        </div>
                        
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">{record.notes}</p>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMortalityMenuId(openMortalityMenuId === record.id ? null : record.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMortalityMenuId === record.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                if (record.field_id) setFilterFieldId(record.field_id);
                                setOpenMortalityMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              Filter by field
                            </button>
                            <button
                              onClick={() => {
                                setFilterVariety(record.variety);
                                setOpenMortalityMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              Filter by variety
                            </button>
                            <button
                              onClick={() => {
                                clearFilters();
                                setOpenMortalityMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mortality by Cause Chart */}
          {mortalityByCause.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4">Mortality by Cause</h4>
              <div className="space-y-3">
                {mortalityByCause.map(([cause, count]) => {
                  const percentage = (count / totalDead * 100).toFixed(1);
                  return (
                    <div key={cause}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{cause.replace('_', ' ')}</span>
                        <span className="font-semibold">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Nursery Supplier</h3>
              <button
                onClick={() => {
                  setShowSupplierForm(false);
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSupplierSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={e => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification
                  </label>
                  <input
                    type="text"
                    value={supplierForm.certification}
                    onChange={e => setSupplierForm({ ...supplierForm, certification: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Certified Organic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={supplierForm.rating}
                    onChange={e => setSupplierForm({ ...supplierForm, rating: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={supplierForm.address}
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={supplierForm.notes}
                  onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Additional information about the supplier"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {formSubmitting ? 'Adding...' : 'Add Supplier'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupplierForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Form Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Plant Batch</h3>
              <button
                onClick={() => {
                  setShowBatchForm(false);
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={batchForm.batchNumber}
                    onChange={e => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., BATCH-2026-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <select
                    value={batchForm.supplierId}
                    onChange={e => setBatchForm({ ...batchForm, supplierId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variety *
                  </label>
                  <input
                    type="text"
                    value={batchForm.variety}
                    onChange={e => setBatchForm({ ...batchForm, variety: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Gala, Fuji"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rootstock Type *
                  </label>
                  <input
                    type="text"
                    value={batchForm.rootstockType}
                    onChange={e => setBatchForm({ ...batchForm, rootstockType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., M9, MM106"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graft Method
                  </label>
                  <input
                    type="text"
                    value={batchForm.graftMethod}
                    onChange={e => setBatchForm({ ...batchForm, graftMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Whip and tongue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchForm.quantity}
                    onChange={e => setBatchForm({ ...batchForm, quantity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Plant (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={batchForm.costPerPlant}
                    onChange={e => setBatchForm({ ...batchForm, costPerPlant: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost (₹)
                  </label>
                  <input
                    type="text"
                    value={batchForm.quantity && batchForm.costPerPlant 
                      ? (parseInt(batchForm.quantity) * parseFloat(batchForm.costPerPlant)).toFixed(2)
                      : '0.00'
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={batchForm.purchaseDate}
                    onChange={e => setBatchForm({ ...batchForm, purchaseDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.plantingDate}
                    onChange={e => setBatchForm({ ...batchForm, plantingDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planted Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={batchForm.plantedCount}
                    onChange={e => setBatchForm({ ...batchForm, plantedCount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field
                  </label>
                  <select
                    value={batchForm.fieldId}
                    onChange={e => setBatchForm({ ...batchForm, fieldId: e.target.value, treeBlockId: '' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select field</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tree Block
                  </label>
                  <select
                    value={batchForm.treeBlockId}
                    onChange={e => setBatchForm({ ...batchForm, treeBlockId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={!batchForm.fieldId}
                  >
                    <option value="">Select tree block</option>
                    {availableTreeBlocks.map(t => (
                      <option key={t.id} value={t.id}>{t.variety} - Row {t.row_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Location
                  </label>
                  <input
                    type="text"
                    value={batchForm.sourceLocation}
                    onChange={e => setBatchForm({ ...batchForm, sourceLocation: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Number
                  </label>
                  <input
                    type="text"
                    value={batchForm.certificationNumber}
                    onChange={e => setBatchForm({ ...batchForm, certificationNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={batchForm.notes}
                  onChange={e => setBatchForm({ ...batchForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Additional information about this batch"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {formSubmitting ? 'Adding...' : 'Add Batch'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mortality Form Modal */}
      {showMortalityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Record Tree Mortality</h3>
              <button
                onClick={() => {
                  setShowMortalityForm(false);
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleMortalitySubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variety *
                  </label>
                  <input
                    type="text"
                    value={mortalityForm.variety}
                    onChange={e => setMortalityForm({ ...mortalityForm, variety: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tree Identifier
                  </label>
                  <input
                    type="text"
                    value={mortalityForm.treeIdentifier}
                    onChange={e => setMortalityForm({ ...mortalityForm, treeIdentifier: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., A1-R5-T12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cause of Death *
                  </label>
                  <select
                    value={mortalityForm.causeOfDeath}
                    onChange={e => setMortalityForm({ ...mortalityForm, causeOfDeath: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="disease">Disease</option>
                    <option value="pest">Pest</option>
                    <option value="weather">Weather</option>
                    <option value="water_stress">Water stress</option>
                    <option value="mechanical_damage">Mechanical damage</option>
                    <option value="poor_rootstock">Poor rootstock</option>
                    <option value="transplant_shock">Transplant shock</option>
                    <option value="soil_issues">Soil issues</option>
                    <option value="age">Age</option>
                    <option value="unknown">Unknown</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Death Date *
                  </label>
                  <input
                    type="date"
                    value={mortalityForm.deathDate}
                    onChange={e => setMortalityForm({ ...mortalityForm, deathDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tree Age (months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mortalityForm.treeAgeMonths}
                    onChange={e => setMortalityForm({ ...mortalityForm, treeAgeMonths: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field
                  </label>
                  <select
                    value={mortalityForm.fieldId}
                    onChange={e => setMortalityForm({ ...mortalityForm, fieldId: e.target.value, treeBlockId: '' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select field</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tree Block
                  </label>
                  <select
                    value={mortalityForm.treeBlockId}
                    onChange={e => setMortalityForm({ ...mortalityForm, treeBlockId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={!mortalityForm.fieldId}
                  >
                    <option value="">Select tree block</option>
                    {availableTreeBlocks.map(t => (
                      <option key={t.id} value={t.id}>{t.variety} - Row {t.row_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nursery Batch
                  </label>
                  <select
                    value={mortalityForm.nurseryBatchId}
                    onChange={e => setMortalityForm({ ...mortalityForm, nurseryBatchId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select batch</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_number} - {b.variety}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Replacement Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="replaced"
                      checked={mortalityForm.replaced}
                      onChange={e => setMortalityForm({ ...mortalityForm, replaced: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="replaced" className="text-sm font-medium text-gray-700">
                      Tree has been replaced
                    </label>
                  </div>

                  {mortalityForm.replaced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Replacement Date
                        </label>
                        <input
                          type="date"
                          value={mortalityForm.replacementDate}
                          onChange={e => setMortalityForm({ ...mortalityForm, replacementDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Replacement Cost (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={mortalityForm.replacementCost}
                          onChange={e => setMortalityForm({ ...mortalityForm, replacementCost: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Replacement Batch
                        </label>
                        <select
                          value={mortalityForm.replacementBatchId}
                          onChange={e => setMortalityForm({ ...mortalityForm, replacementBatchId: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Select replacement batch</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.batch_number} - {b.variety}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={mortalityForm.notes}
                  onChange={e => setMortalityForm({ ...mortalityForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Additional details about the mortality"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {formSubmitting ? 'Recording...' : 'Record Mortality'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMortalityForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
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
