import { useState, useMemo } from 'react';
import { useFinances } from '../hooks/useFinances';
import { useHarvest } from '../hooks/useHarvest';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useInventory } from '../hooks/useInventory';
import { useEquipment } from '../hooks/useEquipment';
import { useFields } from '../hooks/useFields';
import { PoundSterling, TrendingUp, TrendingDown, Plus, Filter, BarChart3, PieChart, Settings, Apple, Bug, Package, Wrench, Sprout } from 'lucide-react';

type TimeView = 'monthly' | 'yearly';

export function FinancialLedger() {
  const { finances, loading, error, addFinancialEntry } = useFinances();
  const { harvest, loading: harvestLoading } = useHarvest();
  const { pestTreatments, loading: pestLoading } = usePestTreatments();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { fields, loading: fieldsLoading } = useFields();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [timeView, setTimeView] = useState<TimeView>('monthly');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('income');
  const [formCategory, setFormCategory] = useState('sales');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Budget state (in real app, this would be stored in database)
  const [budgets, setBudgets] = useState<Record<string, number>>({
    labor: 50000,
    fertilizer: 30000,
    pesticide: 20000,
    equipment: 40000,
    fuel: 15000,
  });

  // Compute monthly/yearly data
  const monthlyData = useMemo(() => {
    if (loading || harvestLoading || pestLoading || inventoryLoading || equipmentLoading || fieldsLoading) return [];
    
    const grouped: Record<string, { income: number; expenses: number; profit: number }> = {};
    
    finances.forEach(entry => {
      const date = new Date(entry.entry_date);
      const key = timeView === 'monthly' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;
      
      if (!grouped[key]) {
        grouped[key] = { income: 0, expenses: 0, profit: 0 };
      }
      
      if (entry.entry_type === 'income') {
        grouped[key].income += entry.amount || 0;
      } else {
        grouped[key].expenses += entry.amount || 0;
      }
      grouped[key].profit = grouped[key].income - grouped[key].expenses;
    });
    
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [finances, timeView]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    finances
      .filter(f => f.entry_type === 'expense')
      .forEach(entry => {
        breakdown[entry.category] = (breakdown[entry.category] || 0) + (entry.amount || 0);
      });
    
    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [finances]);

  // Budget comparison
  const budgetComparison = useMemo(() => {
    const actual: Record<string, number> = {};
    
    finances
      .filter(f => f.entry_type === 'expense')
      .forEach(entry => {
        actual[entry.category] = (actual[entry.category] || 0) + (entry.amount || 0);
      });
    
    return Object.keys(budgets).map(category => ({
      category,
      budget: budgets[category],
      actual: actual[category] || 0,
      variance: budgets[category] - (actual[category] || 0),
      percentage: ((actual[category] || 0) / budgets[category]) * 100,
    }));
  }, [finances, budgets]);

  if (loading || harvestLoading || pestLoading || inventoryLoading || equipmentLoading || fieldsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading financial data: {error}</p>
      </div>
    );
  }

  const totalIncome = finances.filter(f => f.entry_type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalExpenses = finances.filter(f => f.entry_type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  const filteredFinances = selectedCategory === 'all' 
    ? finances 
    : finances.filter(f => f.category === selectedCategory);

  const categories = [
    'all',
    'sales',
    'purchases',
    'equipment',
    'fertilizer',
    'pesticide',
    'labor',
    'fuel',
    'utilities',
    'transport',
    'repairs',
    'insurance',
    'taxes',
    'rent',
    'storage',
    'marketing',
    'misc'
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'fertilizer': return 'bg-yellow-100 text-yellow-800';
      case 'pesticide': return 'bg-red-100 text-red-800';
      case 'labor': return 'bg-purple-100 text-purple-800';
      case 'fuel': return 'bg-amber-100 text-amber-800';
      case 'utilities': return 'bg-indigo-100 text-indigo-800';
      case 'transport': return 'bg-cyan-100 text-cyan-800';
      case 'repairs': return 'bg-orange-100 text-orange-800';
      case 'insurance': return 'bg-slate-100 text-slate-800';
      case 'taxes': return 'bg-rose-100 text-rose-800';
      case 'rent': return 'bg-lime-100 text-lime-800';
      case 'storage': return 'bg-teal-100 text-teal-800';
      case 'marketing': return 'bg-fuchsia-100 text-fuchsia-800';
      case 'misc': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Financial Ledger</h2>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button 
            onClick={() => setShowBudgetModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Budgets</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Operational Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Apple size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Harvests</span>
            </div>
            <p className="text-xl font-bold text-green-800">{harvest.length}</p>
            <p className="text-xs text-green-600">₹{harvest.reduce((s, h) => s + (h.total_revenue || 0), 0).toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Bug size={14} className="text-red-600" />
              <span className="text-xs font-medium text-red-700">Pest Costs</span>
            </div>
            <p className="text-xl font-bold text-red-800">{pestTreatments.length}</p>
            <p className="text-xs text-red-600">₹{pestTreatments.reduce((s, p) => s + (p.cost || 0), 0).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Package size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Inventory</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{inventory.length}</p>
            <p className="text-xs text-blue-600">₹{inventory.reduce((s, i) => s + ((i.quantity || 0) * (i.price_per_unit || 0)), 0).toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Wrench size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Equipment</span>
            </div>
            <p className="text-xl font-bold text-purple-800">{equipment.length}</p>
            <p className="text-xs text-purple-600">{equipment.filter(e => e.ownership === 'owned').length} owned</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Sprout size={14} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Fields</span>
            </div>
            <p className="text-xl font-bold text-amber-800">{fields.length}</p>
	            <p className="text-xs text-amber-600">{fields.reduce((s, f) => s + (f.area || 0), 0).toFixed(1)} kanal</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-800">₹{totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-800">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="text-red-600" size={32} />
          </div>
        </div>

        <div className={`${netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'} font-medium`}>Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                ₹{netProfit.toLocaleString()}
              </p>
            </div>
            <PoundSterling className={`${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} size={32} />
          </div>
        </div>
      </div>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly/Yearly Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {timeView === 'monthly' ? 'Monthly' : 'Yearly'} Trend
              </h3>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => setTimeView('monthly')}
                className={`px-3 py-1 text-sm font-medium ${
                  timeView === 'monthly'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeView('yearly')}
                className={`px-3 py-1 text-sm font-medium ${
                  timeView === 'yearly'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-around space-x-2">
            {monthlyData.map(([period, data]) => {
              const maxValue = Math.max(...monthlyData.map(([, d]) => Math.max(d.income, d.expenses)));
              const incomeHeight = (data.income / maxValue) * 100;
              const expenseHeight = (data.expenses / maxValue) * 100;
              
              return (
                <div key={period} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex justify-center space-x-1 h-48">
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-green-500 rounded-t"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: ₹${data.income.toLocaleString()}`}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-red-500 rounded-t"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: ₹${data.expenses.toLocaleString()}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 text-center">
                    {timeView === 'monthly' 
                      ? new Date(period + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                      : period}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Expenses</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart size={20} className="text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            {categoryBreakdown.length > 0 ? (
              <svg viewBox="0 0 200 200" className="w-48 h-48">
                {(() => {
                  const total = categoryBreakdown.reduce((sum, [, amount]) => sum + amount, 0);
                  let currentAngle = -90;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                  
                  return categoryBreakdown.map(([category, amount], index) => {
                    const percentage = (amount / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;
                    
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + 80 * Math.cos(startRad);
                    const y1 = 100 + 80 * Math.sin(startRad);
                    const x2 = 100 + 80 * Math.cos(endRad);
                    const y2 = 100 + 80 * Math.sin(endRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                      <g key={category}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[index % colors.length]}
                          opacity="0.8"
                        >
                          <title>{`${category}: ₹${amount.toLocaleString()} (${percentage.toFixed(1)}%)`}</title>
                        </path>
                      </g>
                    );
                  });
                })()}
              </svg>
            ) : (
              <p className="text-gray-500">No expense data available</p>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {categoryBreakdown.slice(0, 6).map(([category, amount], index) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
              const total = categoryBreakdown.reduce((sum, [, amt]) => sum + amt, 0);
              const percentage = ((amount / total) * 100).toFixed(1);
              
              return (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                    <span className="text-gray-700 capitalize">{category}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    ₹{amount.toLocaleString()} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profit Margin Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">Profit Margin Trend</h3>
        </div>
        <div className="h-48 relative">
          {monthlyData.length > 0 ? (
            <svg viewBox="0 0 600 180" className="w-full h-full">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => (
                <line
                  key={pct}
                  x1="0"
                  y1={180 - (pct * 1.6)}
                  x2="600"
                  y2={180 - (pct * 1.6)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Profit line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={monthlyData.map(([, data], index) => {
                  const x = (index / Math.max(monthlyData.length - 1, 1)) * 560 + 20;
                  const margin = data.income > 0 ? (data.profit / data.income) * 100 : 0;
                  const y = 180 - Math.max(0, Math.min(margin * 1.6, 160));
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {monthlyData.map(([period, data], index) => {
                const x = (index / Math.max(monthlyData.length - 1, 1)) * 560 + 20;
                const margin = data.income > 0 ? (data.profit / data.income) * 100 : 0;
                const y = 180 - Math.max(0, Math.min(margin * 1.6, 160));
                
                return (
                  <circle
                    key={period}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#10b981"
                  >
                    <title>{`${period}: ${margin.toFixed(1)}% margin`}</title>
                  </circle>
                );
              })}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No profit data available</p>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {monthlyData.map(([period]) => (
            <span key={period}>
              {timeView === 'monthly' 
                ? new Date(period + '-01').toLocaleDateString('en-US', { month: 'short' })
                : period}
            </span>
          ))}
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual</h3>
          <span className="text-sm text-gray-500">Expense Categories</span>
        </div>
        <div className="space-y-4">
          {budgetComparison.map(item => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 capitalize">{item.category}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    ₹{item.actual.toLocaleString()} / ₹{item.budget.toLocaleString()}
                  </span>
                  <span className={`font-semibold ${
                    item.percentage > 100 ? 'text-red-600' : 
                    item.percentage > 80 ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                    item.percentage > 100 ? 'bg-red-500' : 
                    item.percentage > 80 ? 'bg-amber-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Filter size={16} className="text-gray-400" />
          <span className="font-medium text-gray-700">Filter by Category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {filteredFinances.map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    <h4 className="font-medium text-gray-900">{entry.description}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{new Date(entry.entry_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-semibold ${
                    entry.entry_type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.entry_type === 'income' ? '+' : '-'}₹{entry.amount?.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-500">{entry.entry_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Financial Entry</h3>
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

                  if (!formDescription.trim() || !formAmount || !formDate) {
                    setFormError('Please fill in all required fields.');
                    return;
                  }

                  setFormSubmitting(true);
                  const { error: submitError } = await addFinancialEntry({
                    description: formDescription.trim(),
                    entry_type: formType,
                    category: formCategory,
                    amount: Number(formAmount),
                    entry_date: formDate,
                  });
                  setFormSubmitting(false);

                  if (submitError) {
                    setFormError(submitError);
                    return;
                  }

                  setFormDescription('');
                  setFormType('income');
                  setFormCategory('sales');
                  setFormAmount('');
                  setFormDate('');
                  setShowAddForm(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={event => setFormDescription(event.target.value)}
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
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={event => setFormCategory(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="sales">Sales</option>
                      <option value="purchases">Purchases</option>
                      <option value="equipment">Equipment</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="labor">Labor</option>
                      <option value="fuel">Fuel</option>
                      <option value="utilities">Utilities</option>
                      <option value="transport">Transport</option>
                      <option value="repairs">Repairs</option>
                      <option value="insurance">Insurance</option>
                      <option value="taxes">Taxes</option>
                      <option value="rent">Rent</option>
                      <option value="storage">Storage</option>
                      <option value="marketing">Marketing</option>
                      <option value="misc">Misc</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={event => setFormAmount(event.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={event => setFormDate(event.target.value)}
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
                    {formSubmitting ? 'Saving...' : 'Add Entry'}
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

      {/* Budget Management Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Manage Budgets</h3>
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(budgets).map(([category, amount]) => (
                  <div key={category} className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </label>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setBudgets({ ...budgets, [category]: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter budget amount"
                      />
                    </div>
                    <span className="text-sm text-gray-500">₹</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Category Budget</h4>
                  <div className="flex space-x-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      onChange={e => {
                        const category = e.target.value;
                        if (category && !budgets[category]) {
                          setBudgets({ ...budgets, [category]: 0 });
                        }
                      }}
                    >
                      <option value="">Select category...</option>
                      {categories
                        .filter(cat => cat !== 'all' && cat !== 'sales' && !budgets[cat])
                        .map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Budgets
                </button>
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
