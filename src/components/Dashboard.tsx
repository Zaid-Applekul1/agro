import { useMemo } from 'react';
import { useFields } from '../hooks/useFields';
import { useFinances } from '../hooks/useFinances';
import { useInventory } from '../hooks/useInventory';
import { useEquipment } from '../hooks/useEquipment';
import { useHarvest } from '../hooks/useHarvest';
import { useTrees } from '../hooks/useTrees';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useOrchards } from '../hooks/useOrchards';
import { useNursery } from '../hooks/useNursery';
import { useSprayPrograms } from '../hooks/useSprayPrograms';
import { ViewType } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Wrench,
  PoundSterling,
  Apple,
  AlertTriangle,
  Calendar,
  Leaf,
  Droplets,
  Sprout,
  Bug,
  BarChart3,
  MapPin
} from 'lucide-react';

type DashboardProps = {
  onNavigate?: (view: ViewType) => void;
};

const renderSparklinePoints = (values: number[], width: number, height: number, padding: number) => {
  if (values.length === 0) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (width - padding * 2) / Math.max(values.length - 1, 1);

  return values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { fields, loading: fieldsLoading } = useFields();
  const { finances, loading: financesLoading } = useFinances();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { trees, loading: treesLoading } = useTrees();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { orchards, loading: orchardsLoading } = useOrchards();
  const { batches: nurseryBatches, mortality: nurseryMortality, loading: nurseryLoading } = useNursery();
  const { logs: sprayLogs, loading: sprayLoading } = useSprayPrograms();

  const loading = fieldsLoading || financesLoading || inventoryLoading || equipmentLoading || harvestLoading || treesLoading || pestLoading || orchardsLoading || nurseryLoading || sprayLoading;

  const recentHarvest = useMemo(() => harvest.slice(0, 3), [harvest]);
  const recentFinances = useMemo(() => finances.slice(0, 5), [finances]);
  const yieldTrend = useMemo(() => {
    const sorted = [...harvest]
      .filter(record => record.harvest_date)
      .sort((a, b) => new Date(a.harvest_date).getTime() - new Date(b.harvest_date).getTime());
    return sorted.slice(-6).map(record => record.bin_count || 0);
  }, [harvest]);
  const cashflowTrend = useMemo(() => {
    const sorted = [...finances]
      .filter(entry => entry.entry_date)
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
    return sorted.slice(-6).map(entry => (entry.entry_type === 'income' ? 1 : -1) * (entry.amount || 0));
  }, [finances]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totalFields = fields.length;
  const totalTrees = trees.reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
  const totalOrchards = orchards.length;
  const totalMappedTrees = orchards.reduce((sum, o) => sum + (o.tree_count || 0), 0);
  const orchardCoverage = totalTrees > 0 ? Math.round((totalMappedTrees / totalTrees) * 100) : 0;
  const harvestRevenue = harvest.reduce((sum, h) => sum + (h.total_revenue || 0), 0);
  const pendingTreatments = pestTreatments.filter(t => !t.completed).length;
  const totalIncome = finances.filter(f => f.entry_type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalExpenses = finances.filter(f => f.entry_type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const lowStockItems = inventory.filter(i => (i.quantity || 0) < 100).length;
  const equipmentIssues = equipment.filter(e => e.condition === 'poor' || e.condition === 'fair' || e.condition === 'needs_repair').length;
  const servicesDue = equipment.filter(e => {
    if (!e.next_service) return false;
    const serviceDate = new Date(e.next_service);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    return serviceDate <= threshold;
  }).length;
  const expiringInventory = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + 3);
    return expiryDate <= threshold;
  });

  const totalPlanted = nurseryBatches.reduce((sum, batch) => sum + (batch.planted_count || 0), 0);
  const totalDead = nurseryMortality.length;
  const mortalityRate = totalPlanted > 0 ? (totalDead / totalPlanted) * 100 : 0;
  const replacementCost = nurseryMortality.reduce((sum, record) => sum + (record.replacement_cost || 0), 0);

  const totalSprayArea = sprayLogs.reduce((sum, log) => sum + (log.area_kanal || 0), 0);
  const totalSprayProduct = sprayLogs.reduce((sum, log) => sum + (log.total_product || 0), 0);
  const chemicalUsageIndex = totalSprayArea > 0 ? totalSprayProduct / totalSprayArea : totalSprayProduct;
  const complianceWarnings = sprayLogs.filter(log => log.compliance_status === 'warning').length;

  const fertilizerSpend = finances
    .filter(entry => entry.entry_type === 'expense' && entry.category === 'fertilizer')
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const pesticideSpend = finances
    .filter(entry => entry.entry_type === 'expense' && entry.category === 'pesticide')
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const equipmentSpend = finances
    .filter(entry => entry.entry_type === 'expense' && entry.category === 'equipment')
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const carbonEstimateKg = (totalSprayProduct * 0.3) + ((fertilizerSpend + pesticideSpend + equipmentSpend) / 1000);
  const clampScore = (value: number) => Math.max(0, Math.min(100, value));
  const chemicalPenalty = Math.min(40, chemicalUsageIndex * 2);
  const compliancePenalty = Math.min(20, complianceWarnings * 5);
  const carbonPenalty = Math.min(30, carbonEstimateKg / 10);
  const sustainabilityScore = clampScore(100 - chemicalPenalty - compliancePenalty - carbonPenalty);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const summaryCards = [
    {
      title: 'Apple Trees',
      value: totalTrees.toLocaleString(),
      subtitle: `${totalFields} orchard blocks`,
      icon: Apple,
      color: 'emerald'
    },
    {
      title: 'Harvest Revenue',
      value: `₹${harvestRevenue.toLocaleString()}`,
      subtitle: `${harvest.reduce((sum, h) => sum + (h.bin_count || 0), 0)} bins harvested`,
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      color: netProfit >= 0 ? 'emerald' : 'red'
    },
    {
      title: 'Pest Treatments',
      value: pendingTreatments,
      subtitle: 'Treatments pending',
      icon: Package,
      color: pendingTreatments > 0 ? 'amber' : 'emerald'
    },
    {
      title: 'Equipment Status',
      value: `${equipment.length - equipmentIssues}/${equipment.length}`,
      subtitle: 'Equipment in good condition',
      icon: Wrench,
      color: equipmentIssues === 0 ? 'emerald' : 'amber'
    },
    {
      title: 'Mortality Rate',
      value: `${mortalityRate.toFixed(1)}%`,
      subtitle: `${totalDead} dead / ${totalPlanted} planted`,
      icon: AlertTriangle,
      color: mortalityRate <= 5 ? 'emerald' : mortalityRate <= 10 ? 'amber' : 'red'
    },
    {
      title: 'Replacement Cost',
      value: `₹${replacementCost.toLocaleString()}`,
      subtitle: 'Nursery replacements',
      icon: PoundSterling,
      color: replacementCost === 0 ? 'emerald' : 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'amber':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'slate':
        return 'bg-slate-50 border-slate-200 text-slate-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 enter-fade-up">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 shadow-sm soft-lift">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Farm Command Center</p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">Daily Orchard Pulse</h2>
            <p className="mt-2 text-sm text-gray-600">Quick signals across yield, finance, and field health.</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white/70 px-4 py-3 text-right">
            <p className="text-xs text-gray-500">Today</p>
            <p className="text-sm font-medium text-gray-900">{todayLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift enter-fade-up stagger-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Yield Trend</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">Bins Harvested</p>
            </div>
            <Apple size={20} className="text-emerald-500" />
          </div>
          <div className="mt-4">
            {yieldTrend.length > 0 ? (
              <svg viewBox="0 0 160 48" className="h-12 w-full">
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  points={renderSparklinePoints(yieldTrend, 160, 48, 4)}
                />
              </svg>
            ) : (
              <p className="text-sm text-gray-500">No yield data yet.</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">Last {Math.max(yieldTrend.length, 1)} harvest entries</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift enter-fade-up stagger-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Cashflow Trend</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">Income vs Expense</p>
            </div>
            <PoundSterling size={20} className="text-amber-500" />
          </div>
          <div className="mt-4">
            {cashflowTrend.length > 0 ? (
              <svg viewBox="0 0 160 48" className="h-12 w-full">
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  points={renderSparklinePoints(cashflowTrend, 160, 48, 4)}
                />
              </svg>
            ) : (
              <p className="text-sm text-gray-500">No cashflow data yet.</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">Last {Math.max(cashflowTrend.length, 1)} ledger entries</p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6 shadow-sm soft-lift enter-fade-up stagger-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-green-600">Orchard Mapping</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">GPS Integration</p>
            </div>
            <MapPin size={20} className="text-green-500" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mapped Orchards</span>
              <span className="font-bold text-green-700">{totalOrchards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tagged Trees</span>
              <span className="font-bold text-blue-700">{totalMappedTrees}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Coverage</span>
                <span className="text-2xl font-bold text-green-600">{orchardCoverage}%</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">{totalTrees} total trees in system</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift enter-fade-up stagger-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Quick Actions</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">Jump to Modules</p>
            </div>
            <BarChart3 size={20} className="text-blue-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <button
              className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-800 hover:bg-emerald-100"
              onClick={() => onNavigate?.('fields')}
            >
              <span className="flex items-center gap-2"><Sprout size={16} />Fields</span>
            </button>
            <button
              className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-800 hover:bg-amber-100"
              onClick={() => onNavigate?.('harvest')}
            >
              <span className="flex items-center gap-2"><Apple size={16} />Harvest</span>
            </button>
            <button
              className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-800 hover:bg-red-100"
              onClick={() => onNavigate?.('pest')}
            >
              <span className="flex items-center gap-2"><Bug size={16} />Pest Control</span>
            </button>
            <button
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-800 hover:bg-blue-100"
              onClick={() => onNavigate?.('finances')}
            >
              <span className="flex items-center gap-2"><PoundSterling size={16} />Finances</span>
            </button>
            <button
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-800 hover:bg-slate-100"
              onClick={() => onNavigate?.('inventory')}
            >
              <span className="flex items-center gap-2"><Package size={16} />Inventory</span>
            </button>
            <button
              className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-purple-800 hover:bg-purple-100"
              onClick={() => onNavigate?.('equipment')}
            >
              <span className="flex items-center gap-2"><Wrench size={16} />Equipment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`rounded-2xl border-2 p-6 shadow-sm soft-lift enter-fade-up ${getColorClasses(card.color)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs opacity-75 mt-1">{card.subtitle}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-3">
                  <Icon size={28} className="opacity-70" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 shadow-sm soft-lift">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Sustainability Snapshot</p>
            <h3 className="mt-2 text-xl font-semibold text-gray-900">Environmental Footprint</h3>
            <p className="text-sm text-gray-600 mt-1">Derived from spray usage and existing inputs.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Score</p>
            <p className="text-3xl font-bold text-emerald-700">{Math.round(sustainabilityScore)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Chemical Usage Index</p>
            <p className="text-lg font-semibold text-emerald-700">
              {chemicalUsageIndex ? chemicalUsageIndex.toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Product per kanal</p>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Compliance Warnings</p>
            <p className="text-lg font-semibold text-amber-700">{complianceWarnings}</p>
            <p className="text-xs text-gray-500 mt-1">Dose checks</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Carbon Estimate</p>
            <p className="text-lg font-semibold text-blue-700">
              {carbonEstimateKg.toFixed(1)} kg CO2e
            </p>
            <p className="text-xs text-gray-500 mt-1">Proxy from inputs</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Spray Logs</p>
            <p className="text-lg font-semibold text-slate-700">{sprayLogs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Recorded applications</p>
          </div>
        </div>

        {complianceWarnings > 0 && (
          <div className="mt-4 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle size={14} />
            Review warning logs in Spray Programs for compliance details.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Operational Alerts</h3>
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span>Pending treatments</span>
              <span className="font-semibold text-amber-700">{pendingTreatments}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
              <span>Low stock items</span>
              <span className="font-semibold text-red-700">{lowStockItems}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
              <span>Services due (30d)</span>
              <span className="font-semibold text-blue-700">{servicesDue}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Resource Signals</h3>
            <Leaf size={20} className="text-emerald-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <span>Net profit</span>
              <span className={`font-semibold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                ₹{netProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Expiring inventory (90d)</span>
              <span className="font-semibold text-slate-700">{expiringInventory.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <span>Active equipment</span>
              <span className="font-semibold text-green-700">{equipment.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm soft-lift">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Inventory at Risk</h3>
            <Droplets size={20} className="text-blue-500" />
          </div>
          <div className="mt-4 space-y-3">
            {expiringInventory.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Expires {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'TBD'}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
            {expiringInventory.length === 0 && (
              <p className="text-sm text-gray-500">No inventory expiring soon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Field Status Overview */}
      <div className="bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 soft-lift">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orchard Block Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {fields.slice(0, 6).map(field => (
            <div key={field.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{field.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{field.crop} • {field.area} kanal</p>
              <p className="text-xs text-gray-500">Planting Date: {new Date(field.planting_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Harvest Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 soft-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Harvest Activity</h3>
            <span className="text-sm text-gray-500">{harvest.length} records</span>
          </div>
          <div className="space-y-3">
            {recentHarvest.map(harvestRecord => (
              <div key={harvestRecord.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{harvestRecord.variety} - {harvestRecord.bin_count} bins</p>
                  <p className="text-xs text-gray-500">
                    {harvestRecord.quality_grade} grade • {new Date(harvestRecord.harvest_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium text-green-600">
                  ₹{harvestRecord.total_revenue?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 soft-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Financial Activity</h3>
            <PoundSterling size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentFinances.map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{entry.description}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.entry_date).toLocaleDateString()}</p>
                </div>
                <span className={`font-medium ${
                  entry.entry_type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {entry.entry_type === 'income' ? '+' : '-'}₹{entry.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 soft-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Services</h3>
          <Calendar size={20} className="text-gray-400" />
        </div>
        <div className="space-y-3">
          {equipment.filter(eq => eq.next_service).slice(0, 4).map(eq => {
            const isDueSoon = eq.next_service
              ? new Date(eq.next_service) <= new Date(new Date().setDate(new Date().getDate() + 30))
              : false;
            return (
            <div key={eq.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                <p className="text-xs text-gray-500">Next service {eq.next_service ? new Date(eq.next_service).toLocaleDateString() : 'TBD'}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                isDueSoon ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isDueSoon ? 'Due soon' : 'Scheduled'}
              </span>
            </div>
          );
          })}
          {equipment.filter(eq => eq.next_service).length === 0 && (
            <p className="text-sm text-gray-500">No upcoming services scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
