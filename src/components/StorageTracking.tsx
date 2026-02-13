import { useMemo, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useHarvest } from '../hooks/useHarvest';
import { useTrees } from '../hooks/useTrees';
import { useFields } from '../hooks/useFields';
import { useSprayPrograms } from '../hooks/useSprayPrograms';
import { AlertTriangle, ClipboardList, Droplets, Link2, Plus, Send, Thermometer, Truck } from 'lucide-react';

const containerOptions = [
  { value: 'crate', label: 'Crate' },
  { value: 'box', label: 'Box' },
  { value: 'bin', label: 'Bin' },
  { value: 'bag', label: 'Bag' },
  { value: 'other', label: 'Other' },
];

export function StorageTracking() {
  const {
    locations,
    lots,
    movements,
    conditions,
    damageLogs,
    lotLinks,
    dispatches,
    loading,
    error,
    addLocation,
    addLot,
    addMovement,
    addCondition,
    addDamage,
    addLotLink,
    addDispatch,
  } = useStorage();
  const { harvest } = useHarvest();
  const { trees } = useTrees();
  const { fields } = useFields();
  const { logs: sprayLogs } = useSprayPrograms();

  const [activeType, setActiveType] = useState<'warehouse' | 'ca'>('warehouse');
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);

  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [locationCapacity, setLocationCapacity] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  const [lotLocationId, setLotLocationId] = useState('');
  const [lotBatchCode, setLotBatchCode] = useState('');
  const [lotCategory, setLotCategory] = useState<'produce' | 'material'>('produce');
  const [lotItemName, setLotItemName] = useState('');
  const [lotVariety, setLotVariety] = useState('');
  const [lotContainerType, setLotContainerType] = useState('crate');
  const [lotContainerCapacity, setLotContainerCapacity] = useState('20');
  const [lotUnitCount, setLotUnitCount] = useState('');
  const [lotStorageDate, setLotStorageDate] = useState('');
  const [lotExitDate, setLotExitDate] = useState('');
  const [lotNotes, setLotNotes] = useState('');

  const [movementLotId, setMovementLotId] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementQty, setMovementQty] = useState('');
  const [movementDate, setMovementDate] = useState('');
  const [movementRef, setMovementRef] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  const [conditionLotId, setConditionLotId] = useState('');
  const [conditionDate, setConditionDate] = useState('');
  const [conditionTemp, setConditionTemp] = useState('');
  const [conditionHumidity, setConditionHumidity] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');

  const [damageLotId, setDamageLotId] = useState('');
  const [damageDate, setDamageDate] = useState('');
  const [damageUnits, setDamageUnits] = useState('');
  const [shrinkageUnits, setShrinkageUnits] = useState('');
  const [damageReason, setDamageReason] = useState('');

  const [linkLotId, setLinkLotId] = useState('');
  const [linkHarvestId, setLinkHarvestId] = useState('');
  const [linkContainerType, setLinkContainerType] = useState('');
  const [linkContainerCapacity, setLinkContainerCapacity] = useState('');
  const [linkContainerCount, setLinkContainerCount] = useState('');

  const [dispatchLotId, setDispatchLotId] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchUnits, setDispatchUnits] = useState('');
  const [dispatchDestination, setDispatchDestination] = useState('');
  const [dispatchVehicle, setDispatchVehicle] = useState('');
  const [dispatchReference, setDispatchReference] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations.filter(location => location.location_type === activeType);
  }, [locations, activeType]);

  const filteredLots = useMemo(() => {
    const locationIds = new Set(filteredLocations.map(location => location.id));
    return lots.filter(lot => locationIds.has(lot.location_id));
  }, [filteredLocations, lots]);

  const lotMovements = useMemo(() => {
    return movements.reduce<Record<string, typeof movements>>((acc, movement) => {
      acc[movement.lot_id] = acc[movement.lot_id] || [];
      acc[movement.lot_id].push(movement);
      return acc;
    }, {});
  }, [movements]);

  const lotConditions = useMemo(() => {
    return conditions.reduce<Record<string, typeof conditions>>((acc, condition) => {
      acc[condition.lot_id] = acc[condition.lot_id] || [];
      acc[condition.lot_id].push(condition);
      return acc;
    }, {});
  }, [conditions]);

  const lotDamage = useMemo(() => {
    return damageLogs.reduce<Record<string, typeof damageLogs>>((acc, log) => {
      acc[log.lot_id] = acc[log.lot_id] || [];
      acc[log.lot_id].push(log);
      return acc;
    }, {});
  }, [damageLogs]);

  const lotLinksByLot = useMemo(() => {
    return lotLinks.reduce<Record<string, typeof lotLinks>>((acc, link) => {
      acc[link.lot_id] = acc[link.lot_id] || [];
      acc[link.lot_id].push(link);
      return acc;
    }, {});
  }, [lotLinks]);

  const dispatchByLot = useMemo(() => {
    return dispatches.reduce<Record<string, typeof dispatches>>((acc, record) => {
      acc[record.lot_id] = acc[record.lot_id] || [];
      acc[record.lot_id].push(record);
      return acc;
    }, {});
  }, [dispatches]);

  const treeById = useMemo(() => {
    return trees.reduce<Record<string, typeof trees[number]>>((acc, tree) => {
      acc[tree.id] = tree;
      return acc;
    }, {});
  }, [trees]);

  const fieldById = useMemo(() => {
    return fields.reduce<Record<string, typeof fields[number]>>((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {});
  }, [fields]);

  const harvestById = useMemo(() => {
    return harvest.reduce<Record<string, typeof harvest[number]>>((acc, record) => {
      acc[record.id] = record;
      return acc;
    }, {});
  }, [harvest]);

  const sprayByField = useMemo(() => {
    const grouped = sprayLogs.reduce<Record<string, typeof sprayLogs>>((acc, log) => {
      if (!log.field_id) return acc;
      acc[log.field_id] = acc[log.field_id] || [];
      acc[log.field_id].push(log);
      return acc;
    }, {});
    Object.keys(grouped).forEach(fieldId => {
      grouped[fieldId].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
    });
    return grouped;
  }, [sprayLogs]);

  const getLotBalance = (lotId: string, baseUnits: number | null) => {
    const base = baseUnits || 0;
    const moves = lotMovements[lotId] || [];
    const damage = lotDamage[lotId] || [];
    const totalIn = moves.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + (m.quantity_units || 0), 0);
    const totalOut = moves.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + (m.quantity_units || 0), 0);
    const damaged = damage.reduce((sum, d) => sum + (d.damage_units || 0), 0);
    const shrinkage = damage.reduce((sum, d) => sum + (d.shrinkage_units || 0), 0);
    return base + totalIn - totalOut - damaged - shrinkage;
  };

  const totalLots = filteredLots.length;
  const totalUnits = filteredLots.reduce((sum, lot) => sum + (lot.unit_count || 0), 0);
  const totalDamaged = filteredLots.reduce((sum, lot) => {
    const damage = lotDamage[lot.id] || [];
    return sum + damage.reduce((inner, d) => inner + (d.damage_units || 0), 0);
  }, 0);

  const totalShrinkage = filteredLots.reduce((sum, lot) => {
    const damage = lotDamage[lot.id] || [];
    return sum + damage.reduce((inner, d) => inner + (d.shrinkage_units || 0), 0);
  }, 0);

  const resetErrors = () => setFormError(null);

  const generateLotId = () => {
    const location = filteredLocations.find(loc => loc.id === lotLocationId);
    const locationCode = location?.name
      ? location.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()
      : 'LOT';
    const datePart = (lotStorageDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const randomPart = Math.floor(100 + Math.random() * 900).toString();
    setLotBatchCode(`LOT-${datePart}-${locationCode}-${randomPart}`);
  };

  const handleAddLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!locationName.trim()) {
      setFormError('Location name is required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addLocation({
      name: locationName.trim(),
      location_type: activeType,
      capacity_units: locationCapacity ? Number(locationCapacity) : null,
      notes: locationNotes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setLocationName('');
    setLocationCapacity('');
    setLocationNotes('');
    setShowLocationForm(false);
  };

  const handleAddLot = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!lotLocationId || !lotBatchCode.trim() || !lotItemName.trim() || !lotStorageDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    const { data: lotData, error: submitError } = await addLot({
      location_id: lotLocationId,
      batch_code: lotBatchCode.trim(),
      category: lotCategory,
      item_name: lotItemName.trim(),
      variety: lotVariety.trim() || null,
      container_type: lotContainerType,
      container_capacity: lotContainerCapacity.trim() || null,
      unit_count: lotUnitCount ? Number(lotUnitCount) : null,
      storage_date: lotStorageDate,
      exit_date: lotExitDate || null,
      notes: lotNotes.trim() || null,
      status: 'stored',
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    if (lotData?.id && lotUnitCount) {
      await addMovement({
        lot_id: lotData.id,
        movement_type: 'in',
        quantity_units: Number(lotUnitCount),
        moved_at: lotStorageDate || null,
        reference: 'Initial storage',
        notes: null,
      });
    }

    setLotLocationId('');
    setLotBatchCode('');
    setLotCategory('produce');
    setLotItemName('');
    setLotVariety('');
    setLotContainerType('crate');
    setLotContainerCapacity('20');
    setLotUnitCount('');
    setLotStorageDate('');
    setLotExitDate('');
    setLotNotes('');
    setShowLotForm(false);
  };

  const handleAddMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!movementLotId || !movementQty) {
      setFormError('Lot and quantity are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addMovement({
      lot_id: movementLotId,
      movement_type: movementType,
      quantity_units: Number(movementQty),
      moved_at: movementDate || null,
      reference: movementRef.trim() || null,
      notes: movementNotes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setMovementLotId('');
    setMovementType('in');
    setMovementQty('');
    setMovementDate('');
    setMovementRef('');
    setMovementNotes('');
    setShowMovementForm(false);
  };

  const handleAddCondition = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!conditionLotId) {
      setFormError('Lot is required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addCondition({
      lot_id: conditionLotId,
      recorded_at: conditionDate || null,
      temperature_c: conditionTemp ? Number(conditionTemp) : null,
      humidity_pct: conditionHumidity ? Number(conditionHumidity) : null,
      condition_notes: conditionNotes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setConditionLotId('');
    setConditionDate('');
    setConditionTemp('');
    setConditionHumidity('');
    setConditionNotes('');
    setShowConditionForm(false);
  };

  const handleAddDamage = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!damageLotId) {
      setFormError('Lot is required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addDamage({
      lot_id: damageLotId,
      damage_units: damageUnits ? Number(damageUnits) : 0,
      shrinkage_units: shrinkageUnits ? Number(shrinkageUnits) : 0,
      recorded_at: damageDate || null,
      reason: damageReason.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setDamageLotId('');
    setDamageDate('');
    setDamageUnits('');
    setShrinkageUnits('');
    setDamageReason('');
    setShowDamageForm(false);
  };

  const handleAddLotLink = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!linkLotId || !linkHarvestId) {
      setFormError('Lot and harvest record are required.');
      return;
    }

    const count = Number(linkContainerCount || 0);
    const capacity = Number(linkContainerCapacity || 0);
    const fallbackCapacity = linkContainerType === 'crate' && !capacity ? 17 : capacity;
    const weightKg = fallbackCapacity * count;

    setFormSubmitting(true);
    const { error: submitError } = await addLotLink({
      lot_id: linkLotId,
      harvest_id: linkHarvestId,
      container_type: linkContainerType || null,
      container_capacity: linkContainerCapacity || null,
      container_count: count || 0,
      weight_kg: weightKg || 0,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setLinkLotId('');
    setLinkHarvestId('');
    setLinkContainerType('');
    setLinkContainerCapacity('');
    setLinkContainerCount('');
    setShowLinkForm(false);
  };

  const handleAddDispatch = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!dispatchLotId || !dispatchDate) {
      setFormError('Lot and dispatch date are required.');
      return;
    }

    const units = dispatchUnits ? Number(dispatchUnits) : 0;

    setFormSubmitting(true);
    const { error: submitError } = await addDispatch({
      lot_id: dispatchLotId,
      dispatch_date: dispatchDate,
      quantity_units: units,
      destination: dispatchDestination.trim() || null,
      vehicle: dispatchVehicle.trim() || null,
      reference: dispatchReference.trim() || null,
      notes: dispatchNotes.trim() || null,
    });
    if (!submitError && units) {
      await addMovement({
        lot_id: dispatchLotId,
        movement_type: 'out',
        quantity_units: units,
        moved_at: dispatchDate,
        reference: dispatchReference.trim() || 'Dispatch',
        notes: dispatchNotes.trim() || null,
      });
    }
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setDispatchLotId('');
    setDispatchDate('');
    setDispatchUnits('');
    setDispatchDestination('');
    setDispatchVehicle('');
    setDispatchReference('');
    setDispatchNotes('');
    setShowDispatchForm(false);
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
        <p className="text-red-800">Error loading storage data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warehouse & CA Storage</h2>
          <p className="text-sm text-gray-600 mt-1">Track lots, movements, conditions, and shrinkage</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowLocationForm(true)}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Location</span>
          </button>
          <button
            onClick={() => setShowLinkForm(true)}
            className="bg-slate-600 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
          >
            <Link2 size={16} />
            <span>Map Harvest</span>
          </button>
          <button
            onClick={() => setShowLotForm(true)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ClipboardList size={16} />
            <span>Create Lot</span>
          </button>
          <button
            onClick={() => setShowMovementForm(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Truck size={16} />
            <span>Stock Move</span>
          </button>
          <button
            onClick={() => setShowDispatchForm(true)}
            className="bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
          >
            <Send size={16} />
            <span>Dispatch</span>
          </button>
          <button
            onClick={() => setShowConditionForm(true)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Thermometer size={16} />
            <span>Condition Log</span>
          </button>
          <button
            onClick={() => setShowDamageForm(true)}
            className="bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center space-x-2"
          >
            <AlertTriangle size={16} />
            <span>Damage/Shrinkage</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {['warehouse', 'ca'].map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type as 'warehouse' | 'ca')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === type ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'warehouse' ? 'Warehouse' : 'CA Store'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium">Lots Stored</p>
          <p className="text-2xl font-bold text-blue-800">{totalLots}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">Total Units</p>
          <p className="text-2xl font-bold text-green-800">{totalUnits}</p>
        </div>
        <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
          <p className="text-rose-700 font-medium">Damage</p>
          <p className="text-2xl font-bold text-rose-800">{totalDamaged}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 font-medium">Shrinkage</p>
          <p className="text-2xl font-bold text-amber-800">{totalShrinkage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">{activeType === 'warehouse' ? 'Warehouse' : 'CA'} Locations</h3>
          <div className="mt-3 space-y-3">
            {filteredLocations.length === 0 && (
              <p className="text-sm text-gray-500">No locations registered yet.</p>
            )}
            {filteredLocations.map(location => (
              <div key={location.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    {location.capacity_units && (
                      <p className="text-sm text-gray-500">Capacity: {location.capacity_units} units</p>
                    )}
                  </div>
                </div>
                {location.notes && <p className="text-sm text-gray-500 mt-2">{location.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Lots & Movement History</h3>
          <div className="mt-3 space-y-4">
            {filteredLots.length === 0 && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600">
                <p className="font-medium">No lots stored yet.</p>
                <p className="text-sm mt-1">Create a lot to begin tracking storage.</p>
              </div>
            )}

            {filteredLots.map(lot => {
              const balance = getLotBalance(lot.id, lot.unit_count);
              const latestCondition = (lotConditions[lot.id] || [])[0];
              const isExpanded = expandedLotId === lot.id;
              const storageStart = lot.storage_date ? new Date(lot.storage_date) : null;
              const storageEnd = lot.exit_date ? new Date(lot.exit_date) : new Date();
              const storageDays = storageStart
                ? Math.max(0, Math.floor((storageEnd.getTime() - storageStart.getTime()) / (1000 * 60 * 60 * 24)))
                : 0;
              const linkedHarvests = lotLinksByLot[lot.id] || [];
              const traceFields = linkedHarvests
                .map(link => {
                  const harvestRecord = harvestById[link.harvest_id];
                  const tree = harvestRecord?.tree_id ? treeById[harvestRecord.tree_id] : null;
                  return tree?.field_id || null;
                })
                .filter((fieldId): fieldId is string => Boolean(fieldId));
              const uniqueFields = Array.from(new Set(traceFields));
              const sprayLogsForLot = uniqueFields.flatMap(fieldId => sprayByField[fieldId] || []);

              return (
                <div key={lot.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900">{lot.item_name}</p>
                        <span className="text-xs uppercase tracking-wide text-gray-500">{lot.batch_code}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {lot.category === 'produce' ? 'Produce' : 'Material'}
                        {lot.variety ? ` • ${lot.variety}` : ''}
                        {lot.container_type ? ` • ${lot.container_type}` : ''}
                        {lot.container_capacity ? ` ${lot.container_capacity}` : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stored: {new Date(lot.storage_date).toLocaleDateString()}
                        {lot.exit_date ? ` • Exit: ${new Date(lot.exit_date).toLocaleDateString()}` : ''}
                        {storageStart ? ` • ${storageDays} days in storage` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-lg font-semibold text-gray-900">{balance} units</p>
                      </div>
                      <button
                        onClick={() => setExpandedLotId(isExpanded ? null : lot.id)}
                        className="text-sm text-green-700 hover:text-green-900"
                      >
                        {isExpanded ? 'Hide history' : 'View history'}
                      </button>
                    </div>
                  </div>

                  {latestCondition && (
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Thermometer size={14} />
                        <span>{latestCondition.temperature_c ?? '--'}°C</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Droplets size={14} />
                        <span>{latestCondition.humidity_pct ?? '--'}%</span>
                      </div>
                      <span>Last check: {new Date(latestCondition.recorded_at || latestCondition.created_at || '').toLocaleDateString()}</span>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Traceability</h4>
                        {linkedHarvests.length === 0 ? (
                          <p className="text-sm text-gray-500">No harvests linked to this lot.</p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {linkedHarvests.map(link => {
                              const harvestRecord = harvestById[link.harvest_id];
                              const tree = harvestRecord?.tree_id ? treeById[harvestRecord.tree_id] : null;
                              const field = tree?.field_id ? fieldById[tree.field_id] : null;
                              return (
                                <div key={link.id} className="text-sm border border-gray-100 rounded-lg p-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">
                                      {harvestRecord?.variety || 'Harvest'} · {link.container_count || 0} {link.container_type || 'units'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {harvestRecord?.harvest_date ? new Date(harvestRecord.harvest_date).toLocaleDateString() : 'Date N/A'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {field ? `Field: ${field.name}` : 'Field: N/A'}
                                    {tree ? ` • Row ${tree.row_number}` : ''}
                                    {link.weight_kg ? ` • ${link.weight_kg.toFixed(1)} kg` : ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {sprayLogsForLot.length > 0 && (
                          <div className="mt-3 text-xs text-gray-600">
                            Spray history: {sprayLogsForLot.length} log(s). Latest on{' '}
                            {new Date(sprayLogsForLot[0].applied_at).toLocaleDateString()}.
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Movement History</h4>
                        {(lotMovements[lot.id] || []).length === 0 && (
                          <p className="text-sm text-gray-500">No stock movements recorded.</p>
                        )}
                        <div className="mt-2 space-y-2">
                          {(lotMovements[lot.id] || []).map(move => (
                            <div key={move.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg p-2">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {move.movement_type === 'in' ? 'Stock In' : 'Stock Out'} · {move.quantity_units} units
                                </p>
                                {move.reference && <p className="text-xs text-gray-500">Ref: {move.reference}</p>}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(move.moved_at || move.created_at || '').toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Dispatch Records</h4>
                        {(dispatchByLot[lot.id] || []).length === 0 && (
                          <p className="text-sm text-gray-500">No dispatch records yet.</p>
                        )}
                        <div className="mt-2 space-y-2">
                          {(dispatchByLot[lot.id] || []).map(dispatch => (
                            <div key={dispatch.id} className="text-sm border border-gray-100 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                  {dispatch.quantity_units || 0} units · {dispatch.destination || 'Dispatch'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(dispatch.dispatch_date).toLocaleDateString()}
                                </span>
                              </div>
                              {dispatch.reference && <p className="text-xs text-gray-500">Ref: {dispatch.reference}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Condition Logs</h4>
                        {(lotConditions[lot.id] || []).length === 0 && (
                          <p className="text-sm text-gray-500">No condition logs recorded.</p>
                        )}
                        <div className="mt-2 space-y-2">
                          {(lotConditions[lot.id] || []).map(log => (
                            <div key={log.id} className="text-sm border border-gray-100 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">
                                  {log.temperature_c ?? '--'}°C • {log.humidity_pct ?? '--'}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(log.recorded_at || log.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                              {log.condition_notes && <p className="text-xs text-gray-500 mt-1">{log.condition_notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Damage & Shrinkage</h4>
                        {(lotDamage[lot.id] || []).length === 0 && (
                          <p className="text-sm text-gray-500">No damage logs recorded.</p>
                        )}
                        <div className="mt-2 space-y-2">
                          {(lotDamage[lot.id] || []).map(log => (
                            <div key={log.id} className="text-sm border border-gray-100 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Damage: {log.damage_units || 0} · Shrink: {log.shrinkage_units || 0}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(log.recorded_at || log.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                              {log.reason && <p className="text-xs text-gray-500 mt-1">{log.reason}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add {activeType === 'warehouse' ? 'Warehouse' : 'CA'} Location</h3>
                <button onClick={() => setShowLocationForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddLocation}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={event => setLocationName(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (units)</label>
                  <input
                    type="number"
                    value={locationCapacity}
                    onChange={event => setLocationCapacity(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={locationNotes}
                    onChange={event => setLocationNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLocationForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showLotForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Storage Lot</h3>
                <button onClick={() => setShowLotForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddLot}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={lotLocationId}
                    onChange={event => setLotLocationId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select location</option>
                    {filteredLocations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lotBatchCode}
                        onChange={event => setLotBatchCode(event.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateLotId}
                        className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={lotCategory}
                      onChange={event => setLotCategory(event.target.value as 'produce' | 'material')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="produce">Produce</option>
                      <option value="material">Material</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={lotItemName}
                      onChange={event => setLotItemName(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variety (Optional)</label>
                    <input
                      type="text"
                      value={lotVariety}
                      onChange={event => setLotVariety(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
                    <select
                      value={lotContainerType}
                      onChange={event => setLotContainerType(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {containerOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="text"
                      value={lotContainerCapacity}
                      onChange={event => setLotContainerCapacity(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Count</label>
                    <input
                      type="number"
                      value={lotUnitCount}
                      onChange={event => setLotUnitCount(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Date</label>
                    <input
                      type="date"
                      value={lotStorageDate}
                      onChange={event => setLotStorageDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Date (Optional)</label>
                    <input
                      type="date"
                      value={lotExitDate}
                      onChange={event => setLotExitDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={lotNotes}
                    onChange={event => setLotNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Create Lot'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLotForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMovementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Record Movement</h3>
                <button onClick={() => setShowMovementForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddMovement}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
                  <select
                    value={movementLotId}
                    onChange={event => setMovementLotId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select lot</option>
                    {filteredLots.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.item_name} · {lot.batch_code}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                    <select
                      value={movementType}
                      onChange={event => setMovementType(event.target.value as 'in' | 'out')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (units)</label>
                    <input
                      type="number"
                      value={movementQty}
                      onChange={event => setMovementQty(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement Date</label>
                  <input
                    type="date"
                    value={movementDate}
                    onChange={event => setMovementDate(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={movementRef}
                    onChange={event => setMovementRef(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={movementNotes}
                    onChange={event => setMovementNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Movement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMovementForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Map Harvest to Lot</h3>
                <button onClick={() => setShowLinkForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddLotLink}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
                  <select
                    value={linkLotId}
                    onChange={event => setLinkLotId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select lot</option>
                    {filteredLots.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.item_name} · {lot.batch_code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Record</label>
                  <select
                    value={linkHarvestId}
                    onChange={event => {
                      const value = event.target.value;
                      setLinkHarvestId(value);
                      const record = harvestById[value];
                      setLinkContainerType(record?.container_type || 'bin');
                      setLinkContainerCapacity(record?.container_capacity || '');
                      setLinkContainerCount(record?.bin_count?.toString() || '');
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select harvest</option>
                    {harvest.map(record => {
                      const tree = record.tree_id ? treeById[record.tree_id] : null;
                      const field = tree?.field_id ? fieldById[tree.field_id] : null;
                      return (
                        <option key={record.id} value={record.id}>
                          {record.variety} · {record.bin_count || 0} {record.container_type || 'containers'} · {field?.name || 'Field'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
                    <input
                      type="text"
                      value={linkContainerType}
                      onChange={event => setLinkContainerType(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                    <input
                      type="text"
                      value={linkContainerCapacity}
                      onChange={event => setLinkContainerCapacity(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                    <input
                      type="number"
                      value={linkContainerCount}
                      onChange={event => setLinkContainerCount(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDispatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Dispatch Lot</h3>
                <button onClick={() => setShowDispatchForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddDispatch}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
                  <select
                    value={dispatchLotId}
                    onChange={event => setDispatchLotId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select lot</option>
                    {filteredLots.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.item_name} · {lot.batch_code}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date</label>
                    <input
                      type="date"
                      value={dispatchDate}
                      onChange={event => setDispatchDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                    <input
                      type="number"
                      value={dispatchUnits}
                      onChange={event => setDispatchUnits(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={dispatchDestination}
                    onChange={event => setDispatchDestination(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                    <input
                      type="text"
                      value={dispatchVehicle}
                      onChange={event => setDispatchVehicle(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input
                      type="text"
                      value={dispatchReference}
                      onChange={event => setDispatchReference(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={dispatchNotes}
                    onChange={event => setDispatchNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Dispatch'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDispatchForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConditionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Condition Log</h3>
                <button onClick={() => setShowConditionForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddCondition}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
                  <select
                    value={conditionLotId}
                    onChange={event => setConditionLotId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select lot</option>
                    {filteredLots.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.item_name} · {lot.batch_code}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={conditionTemp}
                      onChange={event => setConditionTemp(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={conditionHumidity}
                      onChange={event => setConditionHumidity(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recorded Date</label>
                  <input
                    type="date"
                    value={conditionDate}
                    onChange={event => setConditionDate(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={conditionNotes}
                    onChange={event => setConditionNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Log'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConditionForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDamageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Log Damage/Shrinkage</h3>
                <button onClick={() => setShowDamageForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddDamage}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
                  <select
                    value={damageLotId}
                    onChange={event => setDamageLotId(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select lot</option>
                    {filteredLots.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.item_name} · {lot.batch_code}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Damage Units</label>
                    <input
                      type="number"
                      value={damageUnits}
                      onChange={event => setDamageUnits(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shrinkage Units</label>
                    <input
                      type="number"
                      value={shrinkageUnits}
                      onChange={event => setShrinkageUnits(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recorded Date</label>
                  <input
                    type="date"
                    value={damageDate}
                    onChange={event => setDamageDate(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={damageReason}
                    onChange={event => setDamageReason(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Log'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDamageForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
