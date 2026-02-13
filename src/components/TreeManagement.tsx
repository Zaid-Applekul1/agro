import React, { useMemo, useState } from 'react';
import { useTrees } from '../hooks/useTrees';
import { useFields } from '../hooks/useFields';
import { useDeadTrees } from '../hooks/useDeadTrees';
import { useOrchards } from '../hooks/useOrchards';
import { useHarvest } from '../hooks/useHarvest';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { useFinances } from '../hooks/useFinances';
import {
  AlertTriangle,
  DollarSign,
  Plus,
  Scissors,
  Skull,
  TrendingUp,
  TreePine,
  MapPin,
  Apple,
  Bug
} from 'lucide-react';

export function TreeManagement() {
  const { trees, loading: treesLoading, error: treesError, addTree, updateTree } = useTrees();
  const { fields, loading: fieldsLoading } = useFields();
  const { records: deadRecords, loading: deadLoading, error: deadError, addRecord } = useDeadTrees();
  const { treePoints, loading: orchardsLoading } = useOrchards();
  const { harvest } = useHarvest();
  const { pestTreatments } = usePestTreatments();
  const { finances } = useFinances();

  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [statusValue, setStatusValue] = useState('healthy');

  const loading = treesLoading || fieldsLoading || deadLoading || orchardsLoading;

  const filteredTrees = trees.filter(tree => {
    const fieldMatch = selectedField === 'all' || tree.field_id === selectedField;
    const varietyMatch = selectedVariety === 'all' || tree.variety === selectedVariety;
    return fieldMatch && varietyMatch;
  });

  const varieties = Array.from(new Set(trees.map(tree => tree.variety)));
  const totalTrees = filteredTrees.reduce((s, t) => s + (t.tree_count || 0), 0);
  const totalYield = filteredTrees.reduce((s, t) => s + (t.yield_estimate || 0), 0);
  const healthyCount = filteredTrees.filter(t => t.status === 'healthy').length;

  const filteredDeadRecords = useMemo(() => {
    if (selectedField === 'all') return deadRecords;
    return deadRecords.filter(r => r.field_id === selectedField);
  }, [deadRecords, selectedField]);

  const totalDeadTrees = filteredDeadRecords.reduce((s, r) => s + (r.dead_count || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (treesError || deadError) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        Error loading tree data
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === 'healthy'
      ? 'bg-green-100 text-green-800'
      : s === 'diseased'
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tree Block Management</h2>
          <p className="text-gray-600">Track orchard tree blocks</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Tree Block
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Total Trees" value={totalTrees} icon={<TreePine />} />
        <Stat title="Varieties" value={varieties.length} icon={<Apple />} />
        <Stat title="Est. Yield" value={`${totalYield} bins`} icon={<TrendingUp />} />
        <Stat title="Healthy Blocks" value={`${healthyCount}/${filteredTrees.length}`} icon={<Scissors />} />
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 border rounded flex justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedField('all')}
            className={`px-3 py-1 rounded ${
              selectedField === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100'
            }`}
          >
            All Fields
          </button>
          {fields.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedField(f.id)}
              className={`px-3 py-1 rounded ${
                selectedField === f.id ? 'bg-green-600 text-white' : 'bg-gray-100'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        <select
          value={selectedVariety}
          onChange={e => setSelectedVariety(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Varieties</option>
          {varieties.map(v => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* TREE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrees.map(tree => {
          const field = fields.find(f => f.id === tree.field_id);
          const harvests = harvest.filter(h => h.tree_id === tree.id);
          const pests = pestTreatments.filter(p => p.tree_id === tree.id);
          const gpsCount = treePoints.filter(p => p.tree_block_id === tree.id).length;

          return (
            <div key={tree.id} className="bg-white border rounded p-5 space-y-3">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">Row {tree.row_number}</h3>
                  <p className="text-sm text-gray-500">{field?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${statusColor(tree.status ?? 'unknown')}`}>
                  {tree.status ?? 'unknown'}
                </span>
              </div>

              <p><strong>Trees:</strong> {tree.tree_count}</p>
              <p><strong>Variety:</strong> {tree.variety}</p>
              <p><strong>Planted:</strong> {tree.planting_year}</p>

              {tree.last_pruned && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Scissors size={14} /> Last pruned {new Date(tree.last_pruned).toLocaleDateString()}
                </p>
              )}

              {gpsCount > 0 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <MapPin size={14} /> {gpsCount} GPS points
                </p>
              )}

              {(harvests.length > 0 || pests.length > 0) && (
                <div className="border-t pt-3 space-y-1 text-sm">
                  {harvests.length > 0 && (
                    <p className="flex items-center gap-1 text-green-600">
                      <Apple size={14} /> {harvests.length} harvests
                    </p>
                  )}
                  {pests.length > 0 && (
                    <p className="flex items-center gap-1 text-red-600">
                      <Bug size={14} /> {pests.length} treatments
                    </p>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS – FIXED */}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => {
                    setSelectedTree(tree);
                    setStatusValue(tree.status ?? 'healthy');
                    setShowStatusForm(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  Update Status
                </button>

                <button
                  onClick={() => {
                    setSelectedTree(tree);
                    setShowDetails(true);
                  }}
                  className="flex-1 bg-gray-200 py-2 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== SMALL HELPER COMPONENT ===== */

function Stat({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-white border rounded p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <div className="text-green-600">{icon}</div>
    </div>
  );
}
