import { FormEvent, useMemo, useState } from 'react';
import { useFields } from '../hooks/useFields';
import { usePlantationRegister } from '../hooks/usePlantationRegister';
import { Calendar, Plus, Sprout, TreePine, AlertTriangle } from 'lucide-react';

const calculateAge = (dateValue?: string | null) => {
  if (!dateValue) return 'N/A';
  const today = new Date();
  const planted = new Date(dateValue);
  const diffTime = Math.abs(today.getTime() - planted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years > 0) return `${years}y ${remainingMonths}m`;
  if (months > 0) return `${months}m ${diffDays % 30}d`;
  return `${diffDays}d`;
};

type RowFormState = {
  fieldId: string;
  rowNumber: string;
  variety: string;
  rootstockType: string;
  plantingDate: string;
  notes: string;
};

type TreeFormState = {
  rowId: string;
  treeNumber: string;
  status: 'present' | 'missing';
  plantedDate: string;
  notes: string;
};

export function PlantationRegister() {
  const { fields } = useFields();
  const { rows, trees, loading, error, addRow, addTree, updateTree } = usePlantationRegister();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [showRowForm, setShowRowForm] = useState(false);
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [rowForm, setRowForm] = useState<RowFormState>({
    fieldId: '',
    rowNumber: '',
    variety: '',
    rootstockType: '',
    plantingDate: '',
    notes: '',
  });
  const [treeForm, setTreeForm] = useState<TreeFormState>({
    rowId: '',
    treeNumber: '',
    status: 'present',
    plantedDate: '',
    notes: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const rowsByField = useMemo(() => {
    return rows.reduce<Record<string, typeof rows>>((acc, row) => {
      if (!acc[row.field_id]) acc[row.field_id] = [];
      acc[row.field_id].push(row);
      return acc;
    }, {} as Record<string, typeof rows>);
  }, [rows]);

  const treesByRow = useMemo(() => {
    return trees.reduce<Record<string, typeof trees>>((acc, tree) => {
      if (!acc[tree.row_id]) acc[tree.row_id] = [];
      acc[tree.row_id].push(tree);
      return acc;
    }, {} as Record<string, typeof trees>);
  }, [trees]);

  const totalRows = rows.length;
  const totalTrees = trees.length;
  const missingTrees = trees.filter(tree => tree.status === 'missing').length;

  const handleRowSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!rowForm.fieldId || !rowForm.rowNumber || !rowForm.variety.trim()) {
      setFormError('Field, row number, and variety are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addRow({
      field_id: rowForm.fieldId,
      row_number: Number(rowForm.rowNumber),
      variety: rowForm.variety.trim(),
      rootstock_type: rowForm.rootstockType.trim() || null,
      planting_date: rowForm.plantingDate || null,
      notes: rowForm.notes.trim() || null,
    });

    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    setRowForm({ fieldId: '', rowNumber: '', variety: '', rootstockType: '', plantingDate: '', notes: '' });
    setShowRowForm(false);
  };

  const handleTreeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!treeForm.rowId || !treeForm.treeNumber) {
      setFormError('Row and tree number are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    const result = await addTree({
      row_id: treeForm.rowId,
      tree_number: Number(treeForm.treeNumber),
      status: treeForm.status,
      planted_date: treeForm.plantedDate || null,
      notes: treeForm.notes.trim() || null,
    });

    setFormSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    setTreeForm({ rowId: '', treeNumber: '', status: 'present', plantedDate: '', notes: '' });
    setShowTreeForm(false);
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
        <p className="text-red-800">Error loading plantation register: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TreePine className="text-green-600" />
            Plantation Register
          </h2>
          <p className="text-sm text-gray-600 mt-1">Row-wise and tree-wise orchard census with missing tree tracking.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => {
              setShowRowForm(true);
              setFormError(null);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Row
          </button>
          <button
            onClick={() => {
              setShowTreeForm(true);
              setFormError(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Tree
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">Total Rows</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{totalRows}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">Total Trees</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalTrees}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">Missing Trees</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{missingTrees}</p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <Sprout className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-gray-600">Add a field to start the plantation register.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {fields.map(field => {
            const fieldRows = rowsByField[field.id] || [];
            return (
              <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                    <p className="text-sm text-gray-600">{field.crop} • {field.area} kanal</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {fieldRows.length} rows
                  </span>
                </div>

                {fieldRows.length === 0 ? (
                  <div className="mt-4 text-sm text-gray-500">No rows recorded yet.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {fieldRows.map(row => {
                      const rowTrees = treesByRow[row.id] || [];
                      const missingCount = rowTrees.filter(tree => tree.status === 'missing').length;
                      const plantedDate = row.planting_date;
                      return (
                        <div key={row.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">Row {row.row_number}</h4>
                              <p className="text-sm text-gray-600">{row.variety} {row.rootstock_type ? `• ${row.rootstock_type}` : ''}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {row.planting_date ? calculateAge(row.planting_date) : 'No planting date'}
                                </span>
                                <span>{rowTrees.length} trees</span>
                                {missingCount > 0 && (
                                  <span className="text-amber-700">{missingCount} missing</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              {expandedRowId === row.id ? 'Hide Trees' : 'View Trees'}
                            </button>
                          </div>

                          {expandedRowId === row.id && (
                            <div className="mt-3 border-t border-gray-200 pt-3">
                              {rowTrees.length === 0 ? (
                                <div className="text-xs text-gray-500">No trees recorded.</div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {rowTrees.map(tree => {
                                    const ageSource = tree.planted_date || plantedDate;
                                    return (
                                      <div key={tree.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">Tree {tree.tree_number}</p>
                                          <p className="text-xs text-gray-600">Age: {calculateAge(ageSource)}</p>
                                        </div>
                                        <button
                                          onClick={() => updateTree(tree.id, { status: tree.status === 'present' ? 'missing' : 'present' })}
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            tree.status === 'missing'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-green-100 text-green-800'
                                          }`}
                                        >
                                          {tree.status === 'missing' ? 'Missing' : 'Present'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Row</h3>
              <button onClick={() => setShowRowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleRowSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field *</label>
                <select
                  value={rowForm.fieldId}
                  onChange={event => setRowForm({ ...rowForm, fieldId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Row Number *</label>
                <input
                  type="number"
                  value={rowForm.rowNumber}
                  onChange={event => setRowForm({ ...rowForm, rowNumber: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variety *</label>
                <input
                  type="text"
                  value={rowForm.variety}
                  onChange={event => setRowForm({ ...rowForm, variety: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rootstock</label>
                <input
                  type="text"
                  value={rowForm.rootstockType}
                  onChange={event => setRowForm({ ...rowForm, rootstockType: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                <input
                  type="date"
                  value={rowForm.plantingDate}
                  onChange={event => setRowForm({ ...rowForm, plantingDate: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={rowForm.notes}
                  onChange={event => setRowForm({ ...rowForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? 'Saving...' : 'Save Row'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTreeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Tree</h3>
              <button onClick={() => setShowTreeForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleTreeSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Row *</label>
                <select
                  value={treeForm.rowId}
                  onChange={event => setTreeForm({ ...treeForm, rowId: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select row</option>
                  {rows.map(row => {
                    const field = fields.find(f => f.id === row.field_id);
                    return (
                      <option key={row.id} value={row.id}>
                        {field?.name || 'Field'} - Row {row.row_number} ({row.variety})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tree Number *</label>
                <input
                  type="number"
                  value={treeForm.treeNumber}
                  onChange={event => setTreeForm({ ...treeForm, treeNumber: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={treeForm.status}
                  onChange={event => setTreeForm({ ...treeForm, status: event.target.value as 'present' | 'missing' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="present">Present</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planted Date</label>
                <input
                  type="date"
                  value={treeForm.plantedDate}
                  onChange={event => setTreeForm({ ...treeForm, plantedDate: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={treeForm.notes}
                  onChange={event => setTreeForm({ ...treeForm, notes: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? 'Saving...' : 'Save Tree'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTreeForm(false)}
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
