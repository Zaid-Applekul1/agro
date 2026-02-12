import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useFields } from '../hooks/useFields';
import { useFinances } from '../hooks/useFinances';
import { useTrees } from '../hooks/useTrees';
import { AlertTriangle, BarChart3, Plus } from 'lucide-react';

const categories = [
  'labor',
  'fertilizer',
  'pesticide',
  'equipment',
  'fuel',
  'utilities',
  'transport',
  'repairs',
  'insurance',
  'taxes',
  'rent',
  'storage',
  'marketing',
  'misc',
];

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const toDateOnly = (value: string) => new Date(value + 'T00:00:00');

export function BudgetPlanner() {
  const { budgets, items, loading, error, addBudget, addItem } = useBudgets();
  const { fields } = useFields();
  const { trees } = useTrees();
  const { finances } = useFinances();

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [budgetForm, setBudgetForm] = useState({
    season: '',
    cropCycle: '',
    fieldId: '',
    startDate: '',
    endDate: '',
    perTreeBudget: '',
    alertThreshold: '90',
    status: 'planned',
    notes: '',
  });

  const [itemForm, setItemForm] = useState({
    budgetId: '',
    category: 'labor',
    plannedAmount: '',
  });

  useEffect(() => {
    if (!selectedBudgetId && budgets.length > 0) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  const itemsByBudget = useMemo(() => {
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.budget_id]) acc[item.budget_id] = [];
      acc[item.budget_id].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items]);

  const totalsByBudget = useMemo(() => {
    return budgets.reduce<Record<string, { planned: number; actual: number; variance: number }>>((acc, budget) => {
      const planned = (itemsByBudget[budget.id] || []).reduce(
        (sum, item) => sum + (item.planned_amount || 0),
        0
      );

      const actual = finances
        .filter(entry => entry.entry_type === 'expense')
        .filter(entry => {
          const entryDate = new Date(entry.entry_date);
          return entryDate >= new Date(budget.start_date) && entryDate <= new Date(budget.end_date);
        })
        .reduce((sum, entry) => sum + (entry.amount || 0), 0);

      acc[budget.id] = {
        planned,
        actual,
        variance: planned - actual,
      };
      return acc;
    }, {} as Record<string, { planned: number; actual: number; variance: number }>);
  }, [budgets, itemsByBudget, finances]);

  const selectedBudget = selectedBudgetId ? budgets.find(budget => budget.id === selectedBudgetId) : null;

  const selectedBudgetItems = selectedBudgetId ? itemsByBudget[selectedBudgetId] || [] : [];

  const fieldTreeCount = useMemo(() => {
    if (!selectedBudget?.field_id) return null;
    return trees
      .filter(tree => tree.field_id === selectedBudget.field_id)
      .reduce((sum, tree) => sum + (tree.tree_count || 0), 0);
  }, [selectedBudget, trees]);

  const actualByCategory = useMemo(() => {
    if (!selectedBudget) return {} as Record<string, number>;
    const result: Record<string, number> = {};
    finances
      .filter(entry => entry.entry_type === 'expense')
      .filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= new Date(selectedBudget.start_date) && entryDate <= new Date(selectedBudget.end_date);
      })
      .forEach(entry => {
        result[entry.category] = (result[entry.category] || 0) + (entry.amount || 0);
      });
    return result;
  }, [finances, selectedBudget]);

  const budgetComparison = useMemo(() => {
    return selectedBudgetItems.map(item => {
      const actual = actualByCategory[item.category] || 0;
      const planned = item.planned_amount || 0;
      return {
        category: item.category,
        planned,
        actual,
        variance: planned - actual,
        percentage: planned > 0 ? (actual / planned) * 100 : 0,
      };
    });
  }, [selectedBudgetItems, actualByCategory]);

  const alerts = useMemo(() => {
    if (!selectedBudget) return [] as typeof budgetComparison;
    const threshold = selectedBudget.alert_threshold_pct || 90;
    return budgetComparison.filter(item => item.planned > 0 && item.percentage >= threshold);
  }, [budgetComparison, selectedBudget]);

  const summaryTotals = useMemo(() => {
    const planned = budgets.reduce((sum, budget) => sum + (totalsByBudget[budget.id]?.planned || 0), 0);
    const actual = budgets.reduce((sum, budget) => sum + (totalsByBudget[budget.id]?.actual || 0), 0);
    return {
      budgets: budgets.length,
      planned,
      actual,
      variance: planned - actual,
    };
  }, [budgets, totalsByBudget]);

  const resetBudgetForm = () => {
    setBudgetForm({
      season: '',
      cropCycle: '',
      fieldId: '',
      startDate: '',
      endDate: '',
      perTreeBudget: '',
      alertThreshold: '90',
      status: 'planned',
      notes: '',
    });
    setFormError(null);
  };

  const resetItemForm = () => {
    setItemForm({
      budgetId: selectedBudgetId || '',
      category: 'labor',
      plannedAmount: '',
    });
    setFormError(null);
  };

  const handleBudgetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!budgetForm.season.trim() || !budgetForm.startDate || !budgetForm.endDate) {
      setFormError('Season, start date, and end date are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addBudget({
      season: budgetForm.season.trim(),
      crop_cycle: budgetForm.cropCycle.trim() || null,
      field_id: budgetForm.fieldId || null,
      start_date: budgetForm.startDate,
      end_date: budgetForm.endDate,
      per_tree_budget: Number(budgetForm.perTreeBudget || 0),
      alert_threshold_pct: Number(budgetForm.alertThreshold || 90),
      status: budgetForm.status,
      notes: budgetForm.notes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetBudgetForm();
    setShowBudgetForm(false);
  };

  const handleItemSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!itemForm.budgetId || !itemForm.category) {
      setFormError('Budget and category are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addItem({
      budget_id: itemForm.budgetId,
      category: itemForm.category,
      planned_amount: Number(itemForm.plannedAmount || 0),
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetItemForm();
    setShowItemForm(false);
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
        <p className="text-red-800">Error loading budgets: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seasonal Budget Planner</h2>
          <p className="text-sm text-gray-600 mt-1">Plan budgets by season, crop cycle, and orchard block</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              resetBudgetForm();
              setShowBudgetForm(true);
            }}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Budget</span>
          </button>
          <button
            onClick={() => {
              resetItemForm();
              setShowItemForm(true);
            }}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <BarChart3 size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium">Active Budgets</p>
          <p className="text-2xl font-bold text-blue-800">{summaryTotals.budgets}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">Planned Budget</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(summaryTotals.planned)}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 font-medium">Actual Spend</p>
          <p className="text-2xl font-bold text-amber-800">{formatCurrency(summaryTotals.actual)}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-purple-700 font-medium">Variance</p>
          <p className="text-2xl font-bold text-purple-800">{formatCurrency(summaryTotals.variance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Budgets</h3>
          <div className="mt-3 space-y-3">
            {budgets.length === 0 && (
              <p className="text-sm text-gray-500">No budgets yet.</p>
            )}
            {budgets.map(budget => {
              const totals = totalsByBudget[budget.id];
              const isSelected = selectedBudgetId === budget.id;
              return (
                <button
                  key={budget.id}
                  onClick={() => setSelectedBudgetId(budget.id)}
                  className={`w-full text-left border rounded-lg p-3 transition-colors ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{budget.season}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                      {formatCurrency(totals?.variance || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Planned: {formatCurrency(totals?.planned || 0)}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Forecast vs Actual</h3>
            <BarChart3 size={18} className="text-gray-500" />
          </div>
          {!selectedBudget && (
            <div className="mt-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600">
              <p className="font-medium">Select a budget to view details.</p>
            </div>
          )}
          {selectedBudget && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedBudget.season}</p>
                  <p className="text-sm text-gray-500">{selectedBudget.crop_cycle || 'Crop cycle not set'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Alert threshold</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBudget.alert_threshold_pct || 90}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Planned</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalsByBudget[selectedBudget.id]?.planned || 0)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Actual</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalsByBudget[selectedBudget.id]?.actual || 0)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Variance</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalsByBudget[selectedBudget.id]?.variance || 0)}</p>
                </div>
              </div>

              {fieldTreeCount !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs text-emerald-600">Per-tree model</p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {formatCurrency((selectedBudget.per_tree_budget || 0) * fieldTreeCount)} total for {fieldTreeCount} trees
                  </p>
                  <p className="text-xs text-emerald-700">Per-tree budget: {formatCurrency(selectedBudget.per_tree_budget || 0)}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Planned</th>
                      <th className="pb-2 text-right">Actual</th>
                      <th className="pb-2 text-right">Variance</th>
                      <th className="pb-2 text-right">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetComparison.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">No categories added yet.</td>
                      </tr>
                    )}
                    {budgetComparison.map(item => (
                      <tr key={item.category} className="border-b last:border-b-0">
                        <td className="py-3 capitalize">{item.category}</td>
                        <td className="py-3 text-right">{formatCurrency(item.planned)}</td>
                        <td className="py-3 text-right">{formatCurrency(item.actual)}</td>
                        <td className="py-3 text-right">{formatCurrency(item.variance)}</td>
                        <td className="py-3 text-right">{item.percentage.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={18} />
                  <h4 className="font-semibold">Budget Alerts</h4>
                </div>
                <div className="mt-2 space-y-2 text-sm text-amber-700">
                  {alerts.length === 0 && <p>No alerts triggered.</p>}
                  {alerts.map(item => (
                    <p key={item.category}>
                      {item.category} at {item.percentage.toFixed(0)}% of budget (actual {formatCurrency(item.actual)}).
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBudgetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Budget</h3>
                <button onClick={() => setShowBudgetForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleBudgetSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <input
                      type="text"
                      value={budgetForm.season}
                      onChange={event => setBudgetForm({ ...budgetForm, season: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Cycle</label>
                    <input
                      type="text"
                      value={budgetForm.cropCycle}
                      onChange={event => setBudgetForm({ ...budgetForm, cropCycle: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orchard Block</label>
                    <select
                      value={budgetForm.fieldId}
                      onChange={event => setBudgetForm({ ...budgetForm, fieldId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">All blocks</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per-tree Budget</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={budgetForm.perTreeBudget}
                      onChange={event => setBudgetForm({ ...budgetForm, perTreeBudget: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={budgetForm.startDate}
                      onChange={event => setBudgetForm({ ...budgetForm, startDate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={budgetForm.endDate}
                      onChange={event => setBudgetForm({ ...budgetForm, endDate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={budgetForm.alertThreshold}
                      onChange={event => setBudgetForm({ ...budgetForm, alertThreshold: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={budgetForm.status}
                      onChange={event => setBudgetForm({ ...budgetForm, status: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={budgetForm.notes}
                    onChange={event => setBudgetForm({ ...budgetForm, notes: event.target.value })}
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
                    {formSubmitting ? 'Saving...' : 'Save Budget'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBudgetForm(false);
                      resetBudgetForm();
                    }}
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

      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Budget Category</h3>
                <button onClick={() => setShowItemForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleItemSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <select
                      value={itemForm.budgetId}
                      onChange={event => setItemForm({ ...itemForm, budgetId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select budget</option>
                      {budgets.map(budget => (
                        <option key={budget.id} value={budget.id}>{budget.season}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={itemForm.category}
                      onChange={event => setItemForm({ ...itemForm, category: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Amount</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={itemForm.plannedAmount}
                    onChange={event => setItemForm({ ...itemForm, plannedAmount: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                    {formSubmitting ? 'Saving...' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      resetItemForm();
                    }}
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
