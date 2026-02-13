import { FormEvent, useMemo, useState } from 'react';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useHarvest } from '../hooks/useHarvest';
import { useNursery } from '../hooks/useNursery';
import { useOrchardEstablishment } from '../hooks/useOrchardEstablishment';
import { AlertTriangle, TreePine, MapPin } from 'lucide-react';

const KANAL_SQM = 505.857;

const defaultTemplate = {
  land_unit: 'kanal',
  trees_per_kanal: 167,
  row_spacing_m: 3,
  tree_spacing_m: 1,
  orchard_type: 'High Density Apple',
  geometry_type: 'row'
};

const defaultYieldModel = [
  { year_number: 1, min_kg: 0, max_kg: 0 },
  { year_number: 2, min_kg: 0, max_kg: 1 },
  { year_number: 3, min_kg: 3, max_kg: 5 },
  { year_number: 4, min_kg: 8, max_kg: 12 },
  { year_number: 5, min_kg: 15, max_kg: 20 },
  { year_number: 6, min_kg: 20, max_kg: 25 }
];

const varietyOptions = [
  'Gala Schniga Schnico Red',
  'Red Delicious King Roat',
  'Red Delicious Jeromine',
  'Gala TREX',
  'Honeycrisp',
  'Fuji',
  'Gala One',
  'Gala Royal Beaut',
  'Golden Delicious Reindeers',
  'Gala Dark Baron'
];

const costHeads = [
  'Land preparation',
  'Pit digging',
  'Plant cost per tree',
  'Transport',
  'Planting labor',
  'Trellis system',
  'Drip irrigation',
  'Fertilizer base dose',
  'Protection material',
  'Mulch',
  'Support poles',
  'Wiring'
];

const calculateLayout = (kanal: number, rowSpacing: number, treeSpacing: number) => {
  if (!kanal || !rowSpacing || !treeSpacing) {
    return { treesPerKanal: 0, totalTrees: 0, rowsPerKanal: 0, treesPerRow: 0, variancePct: 0 };
  }
  const treesPerKanal = KANAL_SQM / (rowSpacing * treeSpacing);
  const totalTrees = Math.round(treesPerKanal * kanal);
  const side = Math.sqrt(KANAL_SQM);
  const rowsPerKanal = Math.max(1, Math.floor(side / rowSpacing));
  const treesPerRow = Math.max(1, Math.floor(side / treeSpacing));
  const variancePct = ((treesPerKanal - defaultTemplate.trees_per_kanal) / defaultTemplate.trees_per_kanal) * 100;
  return { treesPerKanal, totalTrees, rowsPerKanal, treesPerRow, variancePct };
};

export function OrchardEstablishment() {
  const { fields } = useFields();
  const { trees } = useTrees();
  const { harvest } = useHarvest();
  const { batches: nurseryBatches } = useNursery();
  const {
    templates,
    establishments,
    varieties,
    costs,
    mortality,
    replacements,
    yieldModels,
    visitLogs,
    loading,
    error,
    addTemplate,
    updateTemplate,
    addEstablishment,
    addVariety,
    addCost,
    addMortality,
    addReplacement,
    addYieldModel,
    addVisit,
  } = useOrchardEstablishment();

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [showMortalityForm, setShowMortalityForm] = useState(false);
  const [showReplacementForm, setShowReplacementForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const activeTemplate = templates[0];

  const [templateForm, setTemplateForm] = useState({
    treesPerKanal: activeTemplate?.trees_per_kanal?.toString() || defaultTemplate.trees_per_kanal.toString(),
    rowSpacing: activeTemplate?.row_spacing_m?.toString() || defaultTemplate.row_spacing_m.toString(),
    treeSpacing: activeTemplate?.tree_spacing_m?.toString() || defaultTemplate.tree_spacing_m.toString(),
    orchardType: activeTemplate?.orchard_type || defaultTemplate.orchard_type,
  });

  const [establishmentForm, setEstablishmentForm] = useState({
    fieldId: '',
    name: '',
    location: '',
    totalKanal: '',
    plantationYear: new Date().getFullYear().toString(),
    rowSpacing: templateForm.rowSpacing,
    treeSpacing: templateForm.treeSpacing,
    orchardType: templateForm.orchardType,
    rootstockType: 'M9',
    plantSource: '',
    plantingMethod: '',
    irrigationType: '',
    supportSystem: '',
    branches: '3+',
    pricePerKg: '',
    notes: ''
  });

  const [varietyMix, setVarietyMix] = useState<Array<{ variety: string; percentage: string }>>([
    { variety: varietyOptions[0], percentage: '100' }
  ]);

  const [costForm, setCostForm] = useState({
    establishmentId: '',
    costHead: costHeads[0],
    amountPerKanal: '',
    notes: ''
  });

  const [mortalityForm, setMortalityForm] = useState({
    establishmentId: '',
    rowNumber: '',
    treeNumber: '',
    count: '1',
    causeOfDeath: '',
    deathDate: '',
    notes: ''
  });

  const [replacementForm, setReplacementForm] = useState({
    establishmentId: '',
    mortalityId: '',
    count: '1',
    replacementDate: '',
    replacementCost: '',
    notes: ''
  });

  const [visitForm, setVisitForm] = useState({
    establishmentId: '',
    visitorType: 'Agronomist',
    visitDate: '',
    purpose: '',
    notes: '',
    recommendations: '',
    nextAction: '',
    followUpDate: ''
  });

  const templateLayout = calculateLayout(
    Number(establishmentForm.totalKanal || 0),
    Number(establishmentForm.rowSpacing || 0),
    Number(establishmentForm.treeSpacing || 0)
  );

  const varietyTotal = varietyMix.reduce((sum, item) => sum + Number(item.percentage || 0), 0);

  const costsByEst = useMemo(() => {
    return costs.reduce<Record<string, typeof costs>>((acc, item) => {
      if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
      acc[item.establishment_id].push(item);
      return acc;
    }, {} as Record<string, typeof costs>);
  }, [costs]);

  const mortalityByEst = useMemo(() => {
    return mortality.reduce<Record<string, typeof mortality>>((acc, item) => {
      if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
      acc[item.establishment_id].push(item);
      return acc;
    }, {} as Record<string, typeof mortality>);
  }, [mortality]);

  const replacementsByEst = useMemo(() => {
    return replacements.reduce<Record<string, typeof replacements>>((acc, item) => {
      if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
      acc[item.establishment_id].push(item);
      return acc;
    }, {} as Record<string, typeof replacements>);
  }, [replacements]);

  const varietiesByEst = useMemo(() => {
    return varieties.reduce<Record<string, typeof varieties>>((acc, item) => {
      if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
      acc[item.establishment_id].push(item);
      return acc;
    }, {} as Record<string, typeof varieties>);
  }, [varieties]);

  const visitsByEst = useMemo(() => {
    return visitLogs.reduce<Record<string, typeof visitLogs>>((acc, item) => {
      if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
      acc[item.establishment_id].push(item);
      return acc;
    }, {} as Record<string, typeof visitLogs>);
  }, [visitLogs]);

  const treeFieldMap = useMemo(() => {
    const map = new Map<string, string>();
    trees.forEach(tree => {
      if (tree.id && tree.field_id) {
        map.set(tree.id, tree.field_id);
      }
    });
    return map;
  }, [trees]);

  const harvestByField = useMemo(() => {
    const map = new Map<string, number>();
    harvest.forEach(record => {
      if (!record.tree_id) return;
      const fieldId = treeFieldMap.get(record.tree_id);
      if (!fieldId) return;
      const capacity = Number(record.container_capacity || 0);
      const fallbackCapacity = record.container_type === 'crate' && !capacity ? 17 : capacity;
      const containers = record.bin_count || 0;
      const weightKg = fallbackCapacity * containers;
      if (!weightKg) return;
      map.set(fieldId, (map.get(fieldId) || 0) + weightKg);
    });
    return map;
  }, [harvest, treeFieldMap]);

  const nurseryByField = useMemo(() => {
    const map = new Map<string, { batches: number; plants: number }>();
    nurseryBatches.forEach(batch => {
      if (!batch.field_id) return;
      const plants = batch.planted_count || batch.quantity || 0;
      const entry = map.get(batch.field_id) || { batches: 0, plants: 0 };
      entry.batches += 1;
      entry.plants += plants;
      map.set(batch.field_id, entry);
    });
    return map;
  }, [nurseryBatches]);

  type YieldRow = { year_number: number; min_kg: number; max_kg: number };
  const yieldModelRows: YieldRow[] = useMemo(() => {
    if (yieldModels.length > 0) {
      return yieldModels.map(model => ({
        year_number: model.year_number,
        min_kg: Number(model.min_kg || 0),
        max_kg: Number(model.max_kg || 0)
      }));
    }
    return defaultYieldModel;
  }, [yieldModels]);

  const currentYear = new Date().getFullYear();
  const selectYieldRow = (age: number) => {
    const exact = yieldModelRows.find(row => row.year_number === age);
    if (exact) return exact;
    const last = yieldModelRows[yieldModelRows.length - 1];
    return age > last.year_number ? last : yieldModelRows[0];
  };

  const handleApplyTemplate = async () => {
    setFormSubmitting(true);
    setFormError(null);
    const payload = {
      land_unit: 'kanal',
      trees_per_kanal: Number(templateForm.treesPerKanal),
      row_spacing_m: Number(templateForm.rowSpacing),
      tree_spacing_m: Number(templateForm.treeSpacing),
      orchard_type: templateForm.orchardType,
      geometry_type: 'row'
    };
    const result = activeTemplate
      ? await updateTemplate(activeTemplate.id, payload)
      : await addTemplate(payload);

    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setShowTemplateForm(false);
  };

  const handleEstablishmentSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!establishmentForm.name.trim() || !establishmentForm.totalKanal) {
      setFormError('Orchard name and total land are required.');
      return;
    }

    if (varietyTotal !== 100) {
      setFormError('Variety mix must total 100%.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const rowSpacing = Number(establishmentForm.rowSpacing || 0);
    const treeSpacing = Number(establishmentForm.treeSpacing || 0);
    const totalKanal = Number(establishmentForm.totalKanal || 0);
    const treesPerKanal = Math.round(KANAL_SQM / (rowSpacing * treeSpacing));

    const result = await addEstablishment({
      field_id: establishmentForm.fieldId || null,
      name: establishmentForm.name.trim(),
      location: establishmentForm.location.trim() || null,
      total_kanal: totalKanal,
      plantation_year: Number(establishmentForm.plantationYear),
      row_spacing_m: rowSpacing,
      tree_spacing_m: treeSpacing,
      trees_per_kanal: treesPerKanal,
      orchard_type: establishmentForm.orchardType,
      rootstock_type: establishmentForm.rootstockType.trim() || null,
      plant_source: establishmentForm.plantSource.trim() || null,
      planting_method: establishmentForm.plantingMethod.trim() || null,
      irrigation_type: establishmentForm.irrigationType.trim() || null,
      support_system: establishmentForm.supportSystem.trim() || null,
      branches: establishmentForm.branches,
      price_per_kg: establishmentForm.pricePerKg ? Number(establishmentForm.pricePerKg) : 0,
      notes: establishmentForm.notes.trim() || null,
    });

    if (result.error || !result.data) {
      setFormSubmitting(false);
      setFormError(result.error || 'Failed to save establishment.');
      return;
    }

    const totalTrees = Math.round(treesPerKanal * totalKanal);
    for (const mix of varietyMix) {
      const count = Math.round((Number(mix.percentage) / 100) * totalTrees);
      await addVariety({
        establishment_id: result.data.id,
        variety: mix.variety,
        percentage: Number(mix.percentage),
        tree_count: count,
      });
    }

    setFormSubmitting(false);
    setShowEstablishmentForm(false);
    setEstablishmentForm({
      fieldId: '',
      name: '',
      location: '',
      totalKanal: '',
      plantationYear: new Date().getFullYear().toString(),
      rowSpacing: templateForm.rowSpacing,
      treeSpacing: templateForm.treeSpacing,
      orchardType: templateForm.orchardType,
      rootstockType: 'M9',
      plantSource: '',
      plantingMethod: '',
      irrigationType: '',
      supportSystem: '',
      branches: '3+',
      pricePerKg: '',
      notes: ''
    });
    setVarietyMix([{ variety: varietyOptions[0], percentage: '100' }]);
  };

  const handleCostSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!costForm.establishmentId || !costForm.amountPerKanal) {
      setFormError('Establishment and amount per kanal are required.');
      return;
    }

    const establishment = establishments.find(e => e.id === costForm.establishmentId);
    const totalAmount = establishment ? Number(costForm.amountPerKanal) * Number(establishment.total_kanal || 0) : 0;

    setFormSubmitting(true);
    setFormError(null);
    const result = await addCost({
      establishment_id: costForm.establishmentId,
      cost_head: costForm.costHead,
      amount_per_kanal: Number(costForm.amountPerKanal),
      total_amount: totalAmount,
      notes: costForm.notes.trim() || null,
    });
    setFormSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setCostForm({ establishmentId: '', costHead: costHeads[0], amountPerKanal: '', notes: '' });
    setShowCostForm(false);
  };

  const handleMortalitySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!mortalityForm.establishmentId || !mortalityForm.deathDate) {
      setFormError('Establishment and death date are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addMortality({
      establishment_id: mortalityForm.establishmentId,
      row_number: mortalityForm.rowNumber ? Number(mortalityForm.rowNumber) : null,
      tree_number: mortalityForm.treeNumber ? Number(mortalityForm.treeNumber) : null,
      count: Number(mortalityForm.count || 1),
      cause_of_death: mortalityForm.causeOfDeath.trim() || null,
      death_date: mortalityForm.deathDate,
      notes: mortalityForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setMortalityForm({
      establishmentId: '',
      rowNumber: '',
      treeNumber: '',
      count: '1',
      causeOfDeath: '',
      deathDate: '',
      notes: ''
    });
    setShowMortalityForm(false);
  };

  const handleReplacementSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!replacementForm.establishmentId || !replacementForm.replacementDate) {
      setFormError('Establishment and replacement date are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addReplacement({
      establishment_id: replacementForm.establishmentId,
      mortality_id: replacementForm.mortalityId || null,
      count: Number(replacementForm.count || 1),
      replacement_date: replacementForm.replacementDate,
      replacement_cost: replacementForm.replacementCost ? Number(replacementForm.replacementCost) : 0,
      notes: replacementForm.notes.trim() || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setReplacementForm({
      establishmentId: '',
      mortalityId: '',
      count: '1',
      replacementDate: '',
      replacementCost: '',
      notes: ''
    });
    setShowReplacementForm(false);
  };

  const handleVisitSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!visitForm.establishmentId || !visitForm.visitDate) {
      setFormError('Establishment and visit date are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addVisit({
      establishment_id: visitForm.establishmentId,
      visitor_type: visitForm.visitorType,
      visit_date: visitForm.visitDate,
      purpose: visitForm.purpose.trim() || null,
      notes: visitForm.notes.trim() || null,
      recommendations: visitForm.recommendations.trim() || null,
      photo_urls: null,
      next_action: visitForm.nextAction.trim() || null,
      follow_up_date: visitForm.followUpDate || null,
    });
    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setVisitForm({
      establishmentId: '',
      visitorType: 'Agronomist',
      visitDate: '',
      purpose: '',
      notes: '',
      recommendations: '',
      nextAction: '',
      followUpDate: ''
    });
    setShowVisitForm(false);
  };

  const handleSeedYieldModel = async () => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      for (const row of defaultYieldModel) {
        await addYieldModel({
          year_number: row.year_number,
          min_kg: row.min_kg,
          max_kg: row.max_kg
        });
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to seed yield model.');
    } finally {
      setFormSubmitting(false);
    }
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
        <p className="text-red-800">Error loading establishment data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TreePine className="text-green-600" />
            Orchard Establishment
          </h2>
          <p className="text-sm text-gray-600 mt-1">Plan, register, and track new orchard blocks with standard spacing.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => {
              setShowTemplateForm(true);
              setFormError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Edit Template
          </button>
          <button
            onClick={() => {
              setShowEstablishmentForm(true);
              setFormError(null);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            New Orchard Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">Total Orchards</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{establishments.length}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">Total Kanal</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {establishments.reduce((sum, est) => sum + (est.total_kanal || 0), 0).toFixed(1)}
          </p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">Planned Trees</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {establishments.reduce((sum, est) => sum + Math.round((est.trees_per_kanal || 0) * Number(est.total_kanal || 0)), 0)}
          </p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700">Varieties</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{varieties.length}</p>
        </div>
      </div>

      {yieldModels.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle size={16} />
            Yield model not configured. Seed the default production model.
          </div>
          <button
            onClick={handleSeedYieldModel}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm"
            disabled={formSubmitting}
          >
            Seed Model
          </button>
        </div>
      )}

      {establishments.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <TreePine className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-gray-600">No orchard establishment plans yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {establishments.map(est => {
            const field = fields.find(f => f.id === est.field_id);
            const estVarieties = varietiesByEst[est.id] || [];
            const estCosts = costsByEst[est.id] || [];
            const estMortality = mortalityByEst[est.id] || [];
            const estReplacements = replacementsByEst[est.id] || [];
            const estVisits = visitsByEst[est.id] || [];
            const totalTrees = Math.round((est.trees_per_kanal || 0) * Number(est.total_kanal || 0));
            const deadTrees = estMortality.reduce((sum, entry) => sum + (entry.count || 0), 0);
            const replacedTrees = estReplacements.reduce((sum, entry) => sum + (entry.count || 0), 0);
            const liveTrees = Math.max(0, totalTrees - deadTrees + replacedTrees);
            const mortalityRate = totalTrees > 0 ? (deadTrees / totalTrees) * 100 : 0;
            const costTotal = estCosts.reduce((sum, item) => sum + (item.total_amount || 0), 0);
            const costPerKanal = est.total_kanal ? costTotal / Number(est.total_kanal) : 0;
            const costPerTree = totalTrees > 0 ? costTotal / totalTrees : 0;
            const nurseryInfo = est.field_id ? nurseryByField.get(est.field_id) : undefined;
            const actualYieldKg = est.field_id ? (harvestByField.get(est.field_id) || 0) : 0;
            const age = Math.max(1, currentYear - est.plantation_year + 1);
            const yieldRow = selectYieldRow(age);
            const avgYield = ((yieldRow.min_kg || 0) + (yieldRow.max_kg || 0)) / 2;
            const forecastYieldKg = avgYield * liveTrees;

            const forecastRows = yieldModelRows.map(model => {
              const avgYield = ((model.min_kg || 0) + (model.max_kg || 0)) / 2;
              const totalYield = avgYield * liveTrees;
              const revenue = est.price_per_kg ? totalYield * (est.price_per_kg || 0) : 0;
              return {
                year: model.year_number,
                avgYield,
                totalYield,
                revenue
              };
            });

            let cumulative = 0;
            let breakEvenYear: number | null = null;
            forecastRows.forEach(row => {
              cumulative += row.revenue;
              if (breakEvenYear === null && costTotal > 0 && cumulative >= costTotal) {
                breakEvenYear = row.year;
              }
            });

            return (
              <div key={est.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{est.name}</h3>
                    <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={12} />{est.location || 'Location not set'}</span>
                      <span>{est.total_kanal} kanal</span>
                      {field && <span>Linked: {field.name}</span>}
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{est.orchard_type}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs text-green-700">Planned Trees</p>
                    <p className="text-lg font-semibold text-green-900">{totalTrees}</p>
                    <p className="text-xs text-green-700">{est.trees_per_kanal} / kanal</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs text-amber-700">Live Trees</p>
                    <p className="text-lg font-semibold text-amber-900">{liveTrees}</p>
                    <p className="text-xs text-amber-700">{mortalityRate.toFixed(1)}% mortality</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-700">Cost / Kanal</p>
                    <p className="text-lg font-semibold text-blue-900">₹{costPerKanal.toFixed(0)}</p>
                    <p className="text-xs text-blue-700">₹{costPerTree.toFixed(0)} / tree</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <p className="text-xs text-purple-700">Break-even</p>
                    <p className="text-lg font-semibold text-purple-900">{breakEvenYear ? `Year ${breakEvenYear}` : 'N/A'}</p>
                    <p className="text-xs text-purple-700">Price/kg: ₹{est.price_per_kg || 0}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Actual Yield (kg)</p>
                    <p className="text-lg font-semibold text-slate-900">{actualYieldKg.toFixed(0)}</p>
                    <p className="text-xs text-slate-600">Linked harvest data</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-xs text-emerald-700">Forecast Yield (kg)</p>
                    <p className="text-lg font-semibold text-emerald-900">{forecastYieldKg.toFixed(0)}</p>
                    <p className="text-xs text-emerald-700">Year {age} model</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <p className="text-xs text-orange-700">Nursery Batches</p>
                    <p className="text-lg font-semibold text-orange-900">{nurseryInfo?.batches || 0}</p>
                    <p className="text-xs text-orange-700">{nurseryInfo?.plants || 0} plants</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Variety Mix</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      {estVarieties.length === 0 ? (
                        <p>No varieties recorded.</p>
                      ) : (
                        estVarieties.map(v => (
                          <div key={v.id} className="flex justify-between">
                            <span>{v.variety}</span>
                            <span>{v.tree_count} trees ({v.percentage}%)</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Forecast (avg)</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      {forecastRows.map(row => (
                        <div key={row.year} className="flex justify-between">
                          <span>Year {row.year}</span>
                          <span>{row.totalYield.toFixed(0)} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Visit Logs</p>
                  {estVisits.length === 0 ? (
                    <p className="text-xs text-gray-500 mt-2">No visits recorded.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {estVisits.map(visit => (
                        <div key={visit.id} className="text-xs text-gray-600">
                          {visit.visit_date} • {visit.visitor_type} • {visit.purpose || 'Visit'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => {
                      setCostForm({ ...costForm, establishmentId: est.id });
                      setShowCostForm(true);
                      setFormError(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add Cost
                  </button>
                  <button
                    onClick={() => {
                      setMortalityForm({ ...mortalityForm, establishmentId: est.id });
                      setShowMortalityForm(true);
                      setFormError(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add Mortality
                  </button>
                  <button
                    onClick={() => {
                      setReplacementForm({ ...replacementForm, establishmentId: est.id });
                      setShowReplacementForm(true);
                      setFormError(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add Replacement
                  </button>
                  <button
                    onClick={() => {
                      setVisitForm({ ...visitForm, establishmentId: est.id });
                      setShowVisitForm(true);
                      setFormError(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add Visit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Default Orchard Template</h3>
              <button onClick={() => setShowTemplateForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); handleApplyTemplate(); }} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trees per Kanal</label>
                <input
                  type="number"
                  value={templateForm.treesPerKanal}
                  onChange={event => setTemplateForm({ ...templateForm, treesPerKanal: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Row spacing (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={templateForm.rowSpacing}
                    onChange={event => setTemplateForm({ ...templateForm, rowSpacing: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree spacing (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={templateForm.treeSpacing}
                    onChange={event => setTemplateForm({ ...templateForm, treeSpacing: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orchard Type</label>
                <input
                  type="text"
                  value={templateForm.orchardType}
                  onChange={event => setTemplateForm({ ...templateForm, orchardType: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Template'}
                </button>
                <button type="button" onClick={() => setShowTemplateForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEstablishmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">New Orchard Establishment</h3>
              <button onClick={() => setShowEstablishmentForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEstablishmentSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orchard Name *</label>
                  <input
                    type="text"
                    value={establishmentForm.name}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, name: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={establishmentForm.location}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, location: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field (optional)</label>
                  <select
                    value={establishmentForm.fieldId}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, fieldId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select field</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Land (kanal) *</label>
                  <input
                    type="number"
                    value={establishmentForm.totalKanal}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, totalKanal: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Year *</label>
                  <input
                    type="number"
                    value={establishmentForm.plantationYear}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, plantationYear: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orchard Type</label>
                  <input
                    type="text"
                    value={establishmentForm.orchardType}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, orchardType: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Row spacing (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={establishmentForm.rowSpacing}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, rowSpacing: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree spacing (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={establishmentForm.treeSpacing}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, treeSpacing: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rootstock</label>
                  <input
                    type="text"
                    value={establishmentForm.rootstockType}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, rootstockType: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plant Source</label>
                  <input
                    type="text"
                    value={establishmentForm.plantSource}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, plantSource: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planting Method</label>
                  <input
                    type="text"
                    value={establishmentForm.plantingMethod}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, plantingMethod: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
                  <input
                    type="text"
                    value={establishmentForm.irrigationType}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, irrigationType: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support System</label>
                  <input
                    type="text"
                    value={establishmentForm.supportSystem}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, supportSystem: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branches</label>
                  <select
                    value={establishmentForm.branches}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, branches: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="3+">3+</option>
                    <option value="5+">5+</option>
                    <option value="7+">7+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per kg (₹)</label>
                  <input
                    type="number"
                    value={establishmentForm.pricePerKg}
                    onChange={event => setEstablishmentForm({ ...establishmentForm, pricePerKg: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900">Auto Calculation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Rows / kanal</p>
                    <p className="font-semibold">{templateLayout.rowsPerKanal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trees / row</p>
                    <p className="font-semibold">{templateLayout.treesPerRow}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trees / kanal</p>
                    <p className="font-semibold">{templateLayout.treesPerKanal.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total trees</p>
                    <p className="font-semibold">{templateLayout.totalTrees}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Horticulture standard: {defaultTemplate.trees_per_kanal} trees/kanal • Variance {templateLayout.variancePct.toFixed(1)}%
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900">Variety Mix</h4>
                <div className="space-y-2 mt-2">
                  {varietyMix.map((mix, index) => (
                    <div key={`${mix.variety}-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        value={mix.variety}
                        onChange={event => {
                          const updated = [...varietyMix];
                          updated[index].variety = event.target.value;
                          setVarietyMix(updated);
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1"
                      >
                        {varietyOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={mix.percentage}
                        onChange={event => {
                          const updated = [...varietyMix];
                          updated[index].percentage = event.target.value;
                          setVarietyMix(updated);
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1"
                        placeholder="%"
                      />
                      <button
                        type="button"
                        onClick={() => setVarietyMix(varietyMix.filter((_, i) => i !== index))}
                        className="text-xs text-red-600"
                        disabled={varietyMix.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-600">Total: {varietyTotal}%</div>
                <button
                  type="button"
                  onClick={() => setVarietyMix([...varietyMix, { variety: varietyOptions[0], percentage: '0' }])}
                  className="mt-2 text-xs text-blue-600"
                >
                  + Add Variety
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={establishmentForm.notes}
                  onChange={event => setEstablishmentForm({ ...establishmentForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Orchard'}
                </button>
                <button type="button" onClick={() => setShowEstablishmentForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Cost</h3>
              <button onClick={() => setShowCostForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCostSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment *</label>
                <select
                  value={costForm.establishmentId}
                  onChange={event => setCostForm({ ...costForm, establishmentId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select orchard</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Head</label>
                <select
                  value={costForm.costHead}
                  onChange={event => setCostForm({ ...costForm, costHead: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {costHeads.map(head => (
                    <option key={head} value={head}>{head}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount per kanal (₹)</label>
                <input
                  type="number"
                  value={costForm.amountPerKanal}
                  onChange={event => setCostForm({ ...costForm, amountPerKanal: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={costForm.notes}
                  onChange={event => setCostForm({ ...costForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Cost'}
                </button>
                <button type="button" onClick={() => setShowCostForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMortalityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Mortality</h3>
              <button onClick={() => setShowMortalityForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleMortalitySubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment *</label>
                <select
                  value={mortalityForm.establishmentId}
                  onChange={event => setMortalityForm({ ...mortalityForm, establishmentId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select orchard</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Row #</label>
                  <input
                    type="number"
                    value={mortalityForm.rowNumber}
                    onChange={event => setMortalityForm({ ...mortalityForm, rowNumber: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tree #</label>
                  <input
                    type="number"
                    value={mortalityForm.treeNumber}
                    onChange={event => setMortalityForm({ ...mortalityForm, treeNumber: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                  <input
                    type="number"
                    value={mortalityForm.count}
                    onChange={event => setMortalityForm({ ...mortalityForm, count: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
                  <input
                    type="text"
                    value={mortalityForm.causeOfDeath}
                    onChange={event => setMortalityForm({ ...mortalityForm, causeOfDeath: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Death Date *</label>
                <input
                  type="date"
                  value={mortalityForm.deathDate}
                  onChange={event => setMortalityForm({ ...mortalityForm, deathDate: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={mortalityForm.notes}
                  onChange={event => setMortalityForm({ ...mortalityForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Mortality'}
                </button>
                <button type="button" onClick={() => setShowMortalityForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReplacementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Replacement</h3>
              <button onClick={() => setShowReplacementForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleReplacementSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment *</label>
                <select
                  value={replacementForm.establishmentId}
                  onChange={event => setReplacementForm({ ...replacementForm, establishmentId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select orchard</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mortality Link</label>
                  <select
                    value={replacementForm.mortalityId}
                    onChange={event => setReplacementForm({ ...replacementForm, mortalityId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Optional</option>
                    {mortality.filter(m => m.establishment_id === replacementForm.establishmentId).map(m => (
                      <option key={m.id} value={m.id}>Row {m.row_number || '-'} Tree {m.tree_number || '-'} ({m.count} trees)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                  <input
                    type="number"
                    value={replacementForm.count}
                    onChange={event => setReplacementForm({ ...replacementForm, count: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Date *</label>
                  <input
                    type="date"
                    value={replacementForm.replacementDate}
                    onChange={event => setReplacementForm({ ...replacementForm, replacementDate: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Cost</label>
                  <input
                    type="number"
                    value={replacementForm.replacementCost}
                    onChange={event => setReplacementForm({ ...replacementForm, replacementCost: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={replacementForm.notes}
                  onChange={event => setReplacementForm({ ...replacementForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Replacement'}
                </button>
                <button type="button" onClick={() => setShowReplacementForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVisitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Visit</h3>
              <button onClick={() => setShowVisitForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleVisitSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment *</label>
                <select
                  value={visitForm.establishmentId}
                  onChange={event => setVisitForm({ ...visitForm, establishmentId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select orchard</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Type</label>
                  <select
                    value={visitForm.visitorType}
                    onChange={event => setVisitForm({ ...visitForm, visitorType: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Agronomist">Agronomist</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                  <input
                    type="date"
                    value={visitForm.visitDate}
                    onChange={event => setVisitForm({ ...visitForm, visitDate: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={visitForm.purpose}
                  onChange={event => setVisitForm({ ...visitForm, purpose: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea
                  value={visitForm.recommendations}
                  onChange={event => setVisitForm({ ...visitForm, recommendations: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={visitForm.notes}
                  onChange={event => setVisitForm({ ...visitForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
                  <input
                    type="text"
                    value={visitForm.nextAction}
                    onChange={event => setVisitForm({ ...visitForm, nextAction: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={visitForm.followUpDate}
                    onChange={event => setVisitForm({ ...visitForm, followUpDate: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={formSubmitting} className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Visit'}
                </button>
                <button type="button" onClick={() => setShowVisitForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
