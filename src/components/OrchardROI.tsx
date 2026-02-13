import { FormEvent, useMemo, useState } from 'react';
import { useOrchards } from '../hooks/useOrchards';
import { useTrees } from '../hooks/useTrees';
import { useHarvest } from '../hooks/useHarvest';
import { useNursery } from '../hooks/useNursery';
import { useOrchardCosts } from '../hooks/useOrchardCosts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  TreePine,
  Plus,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';

type CostFormState = {
  orchardId: string;
  costType: 'establishment' | 'annual';
  amount: string;
  costDate: string;
  notes: string;
};

export function OrchardROI() {
  const { orchards, loading: orchardsLoading, error: orchardsError } = useOrchards();
  const { trees, loading: treesLoading } = useTrees();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { batches, loading: nurseryLoading } = useNursery();
  const { costs, loading: costsLoading, error: costsError, addCost } = useOrchardCosts();

  const [showCostForm, setShowCostForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [costForm, setCostForm] = useState<CostFormState>({
    orchardId: '',
    costType: 'establishment',
    amount: '',
    costDate: '',
    notes: '',
  });

  const loading = orchardsLoading || treesLoading || harvestLoading || nurseryLoading || costsLoading;
  const error = orchardsError || costsError;

  const treeById = useMemo(() => {
    return trees.reduce<Record<string, typeof trees[number]>>((acc, tree) => {
      acc[tree.id] = tree;
      return acc;
    }, {});
  }, [trees]);

  const costsByOrchard = useMemo(() => {
    return costs.reduce<Record<string, typeof costs>>((acc, cost) => {
      if (!acc[cost.orchard_id]) acc[cost.orchard_id] = [];
      acc[cost.orchard_id].push(cost);
      return acc;
    }, {} as Record<string, typeof costs>);
  }, [costs]);

  const harvestByField = useMemo(() => {
    const map = new Map<string, typeof harvest>();
    harvest.forEach(record => {
      const tree = record.tree_id ? treeById[record.tree_id] : null;
      if (!tree?.field_id) return;
      const list = map.get(tree.field_id) || [];
      list.push(record);
      map.set(tree.field_id, list);
    });
    return map;
  }, [harvest, treeById]);

  const batchCostsByField = useMemo(() => {
    return batches.reduce<Record<string, number>>((acc, batch) => {
      if (!batch.field_id) return acc;
      acc[batch.field_id] = (acc[batch.field_id] || 0) + (batch.total_cost || 0);
      return acc;
    }, {});
  }, [batches]);

  const orchardMetrics = useMemo(() => {
    return orchards.map(orchard => {
      const fieldId = orchard.field_id;
      const orchardTrees = trees.filter(tree => tree.field_id === fieldId);
      const treeCount = orchardTrees.reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
      const harvestRecords = fieldId ? harvestByField.get(fieldId) || [] : [];
      const revenue = harvestRecords.reduce((sum, record) => sum + (record.total_revenue || 0), 0);
      const nurseryInvestment = fieldId ? (batchCostsByField[fieldId] || 0) : 0;
      const orchardCosts = costsByOrchard[orchard.id] || [];
      const establishmentCosts = orchardCosts
        .filter(cost => cost.cost_type === 'establishment')
        .reduce((sum, cost) => sum + (cost.amount || 0), 0);
      const annualCosts = orchardCosts
        .filter(cost => cost.cost_type === 'annual')
        .reduce((sum, cost) => sum + (cost.amount || 0), 0);
      const totalCost = nurseryInvestment + establishmentCosts + annualCosts;
      const netProfit = revenue - totalCost;
      const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : null;
      const perTreeNet = treeCount > 0 ? netProfit / treeCount : null;

      const revenueByYear = new Map<number, number>();
      harvestRecords.forEach(record => {
        const year = new Date(record.harvest_date).getFullYear();
        revenueByYear.set(year, (revenueByYear.get(year) || 0) + (record.total_revenue || 0));
      });

      const annualCostByYear = new Map<number, number>();
      orchardCosts
        .filter(cost => cost.cost_type === 'annual')
        .forEach(cost => {
          const year = new Date(cost.cost_date).getFullYear();
          annualCostByYear.set(year, (annualCostByYear.get(year) || 0) + (cost.amount || 0));
        });

      const years = Array.from(new Set([...revenueByYear.keys(), ...annualCostByYear.keys()])).sort((a, b) => a - b);
      const establishmentTotal = nurseryInvestment + establishmentCosts;
      let cumulative = -establishmentTotal;
      let paybackYears: number | null = null;
      if (years.length > 0 && establishmentTotal > 0) {
        const startYear = years[0];
        years.forEach(year => {
          const yearNet = (revenueByYear.get(year) || 0) - (annualCostByYear.get(year) || 0);
          cumulative += yearNet;
          if (cumulative >= 0 && paybackYears === null) {
            paybackYears = year - startYear + 1;
          }
        });
      }

      return {
        orchard,
        treeCount,
        revenue,
        nurseryInvestment,
        establishmentCosts,
        annualCosts,
        totalCost,
        netProfit,
        roiPercent,
        perTreeNet,
        paybackYears,
      };
    });
  }, [orchards, trees, harvestByField, batchCostsByField, costsByOrchard]);

  const totalInvestment = orchardMetrics.reduce((sum, item) => sum + item.totalCost, 0);
  const totalRevenue = orchardMetrics.reduce((sum, item) => sum + item.revenue, 0);
  const totalNet = totalRevenue - totalInvestment;
  const averageRoi = totalInvestment > 0 ? (totalNet / totalInvestment) * 100 : 0;

  const handleCostSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!costForm.orchardId || !costForm.amount || !costForm.costDate) {
      setFormError('Orchard, amount, and date are required.');
      return;
    }

    const amount = parseFloat(costForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const result = await addCost({
      orchard_id: costForm.orchardId,
      cost_type: costForm.costType,
      amount,
      cost_date: costForm.costDate,
      notes: costForm.notes.trim() || null,
    });

    setFormSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setCostForm({ orchardId: '', costType: 'establishment', amount: '', costDate: '', notes: '' });
    setShowCostForm(false);
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
        <p className="text-red-800">Error loading ROI data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Orchard ROI Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">Investment vs return analysis by orchard block.</p>
        </div>
        <button
          onClick={() => setShowCostForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Cost
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="text-emerald-600" size={22} />
            <TrendingUp className="text-emerald-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-700 font-medium">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="text-red-600" size={22} />
            <TrendingDown className="text-red-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">₹{totalInvestment.toLocaleString()}</p>
          <p className="text-xs text-red-700 font-medium">Total Investment</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="text-blue-600" size={22} />
            <span className="text-xs text-blue-700 font-semibold">ROI</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{averageRoi.toFixed(1)}%</p>
          <p className="text-xs text-blue-700 font-medium">Average ROI</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <TreePine className="text-purple-600" size={22} />
            <Calendar className="text-purple-400" size={16} />
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">₹{totalNet.toLocaleString()}</p>
          <p className="text-xs text-purple-700 font-medium">Net Profit</p>
        </div>
      </div>

      {orchardMetrics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <TreePine className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 font-medium">No orchards mapped yet</p>
          <p className="text-sm text-gray-500 mt-1">Map orchards to start ROI tracking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orchardMetrics.map(item => {
            const orchard = item.orchard;
            const linkedField = orchard.field_id;
            return (
              <div key={orchard.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{orchard.name}</h3>
                    <p className="text-sm text-gray-600">{orchard.area_hectares?.toFixed(2)} ha • {item.treeCount} trees</p>
                  </div>
                  {item.roiPercent !== null ? (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.roiPercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.roiPercent.toFixed(1)}% ROI
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">No cost data</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-semibold text-emerald-700">₹{item.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Cost</p>
                    <p className="font-semibold text-red-700">₹{item.totalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Profit</p>
                    <p className={`font-semibold ${item.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      ₹{item.netProfit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payback</p>
                    <p className="font-semibold text-gray-900">
                      {item.paybackYears ? `${item.paybackYears} yrs` : 'Not reached'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Nursery investment</span>
                    <span className="font-medium">₹{item.nurseryInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Establishment costs</span>
                    <span className="font-medium">₹{item.establishmentCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual costs</span>
                    <span className="font-medium">₹{item.annualCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net per tree</span>
                    <span className="font-medium">
                      {item.perTreeNet !== null ? `₹${item.perTreeNet.toFixed(1)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {!linkedField && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={14} />
                    <p>Link this orchard to a field to connect harvest revenue and nursery investment.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Orchard Cost</h3>
              <button
                onClick={() => {
                  setShowCostForm(false);
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCostSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orchard *</label>
                <select
                  value={costForm.orchardId}
                  onChange={e => setCostForm({ ...costForm, orchardId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select orchard</option>
                  {orchards.map(orchard => (
                    <option key={orchard.id} value={orchard.id}>{orchard.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type *</label>
                <select
                  value={costForm.costType}
                  onChange={e => setCostForm({ ...costForm, costType: e.target.value as CostFormState['costType'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="establishment">Establishment</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costForm.amount}
                  onChange={e => setCostForm({ ...costForm, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={costForm.costDate}
                  onChange={e => setCostForm({ ...costForm, costDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={costForm.notes}
                  onChange={e => setCostForm({ ...costForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {formSubmitting ? 'Saving...' : 'Save Cost'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCostForm(false);
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
