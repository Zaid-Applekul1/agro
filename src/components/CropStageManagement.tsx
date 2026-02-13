import { FormEvent, useMemo, useState } from 'react';
import { useCropStages } from '../hooks/useCropStages';
import { useFields } from '../hooks/useFields';
import { useTrees } from '../hooks/useTrees';
import { useSprayPrograms } from '../hooks/useSprayPrograms';
import { Calendar, Droplets, Leaf, Plus, Sprout } from 'lucide-react';

export function CropStageManagement() {
  const { fields } = useFields();
  const { trees } = useTrees();
  const { programs } = useSprayPrograms();
  const { stages, records, loading, error, addRecord, seedDefaultStages } = useCropStages();

  const [fieldId, setFieldId] = useState('');
  const [treeBlockId, setTreeBlockId] = useState('');
  const [variety, setVariety] = useState('');
  const [stageId, setStageId] = useState('');
  const [stageDate, setStageDate] = useState('');
  const [rowNumber, setRowNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [filterFieldId, setFilterFieldId] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const stageById = useMemo(() => {
    return stages.reduce<Record<string, typeof stages[number]>>((acc, stage) => {
      acc[stage.id] = stage;
      return acc;
    }, {});
  }, [stages]);

  const treeBlocksForField = useMemo(() => {
    return trees.filter(tree => !fieldId || tree.field_id === fieldId);
  }, [trees, fieldId]);

  const varietyOptions = useMemo(() => {
    const set = new Set<string>();
    trees.forEach(tree => set.add(tree.variety));
    records.forEach(record => {
      if (record.variety) set.add(record.variety);
    });
    return Array.from(set).sort();
  }, [trees, records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (filterFieldId && record.field_id !== filterFieldId) return false;
      if (filterVariety && record.variety !== filterVariety) return false;
      return true;
    });
  }, [records, filterFieldId, filterVariety]);

  const latestStageByBlock = useMemo(() => {
    const latest: Record<string, typeof records[number]> = {};
    records.forEach(record => {
      const key = record.tree_block_id || record.field_id || 'unknown';
      const current = latest[key];
      if (!current || record.stage_date > current.stage_date) {
        latest[key] = record;
      }
    });
    return Object.values(latest);
  }, [records]);

  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    latestStageByBlock.forEach(record => {
      const stageName = stageById[record.stage_id]?.name || 'Unknown';
      counts[stageName] = (counts[stageName] || 0) + 1;
    });
    return counts;
  }, [latestStageByBlock, stageById]);

  const selectedStageName = stageById[stageId]?.name || '';
  const recommendedPrograms = useMemo(() => {
    if (!selectedStageName) return [];
    const needle = selectedStageName.toLowerCase();
    return programs.filter(program => (program.stage || '').toLowerCase().includes(needle));
  }, [programs, selectedStageName]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stageId || !stageDate) {
      setFormError('Stage and date are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const result = await addRecord({
      field_id: fieldId || null,
      tree_block_id: treeBlockId || null,
      variety: variety.trim() || null,
      stage_id: stageId,
      stage_date: stageDate,
      row_number: rowNumber ? Number(rowNumber) : null,
      notes: notes.trim() || null,
    });

    setFormSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setFieldId('');
    setTreeBlockId('');
    setVariety('');
    setStageId('');
    setStageDate('');
    setRowNumber('');
    setNotes('');
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
        <p className="text-red-800">Error loading crop stages: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Leaf className="text-green-600" />
            Crop Stage Tracking
          </h3>
          <p className="text-sm text-gray-600">Mark phenology stages block-wise with advisory links.</p>
        </div>
        {stages.length === 0 && (
          <button
            onClick={() => seedDefaultStages()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Seed default stages
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Stage Records</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{records.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Active Blocks</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{latestStageByBlock.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">Distinct Stages</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{Object.keys(stageDistribution).length}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Sprout size={16} className="text-green-600" />
          Record crop stage
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
            <select
              value={fieldId}
              onChange={event => setFieldId(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select field</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tree Block</label>
            <select
              value={treeBlockId}
              onChange={event => {
                setTreeBlockId(event.target.value);
                const tree = treeBlocksForField.find(item => item.id === event.target.value);
                if (tree?.variety) setVariety(tree.variety);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select block</option>
              {treeBlocksForField.map(tree => (
                <option key={tree.id} value={tree.id}>Row {tree.row_number} · {tree.variety}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
            <select
              value={variety}
              onChange={event => setVariety(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select variety</option>
              {varietyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={stageId}
              onChange={event => setStageId(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select stage</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage Date</label>
            <input
              type="date"
              value={stageDate}
              onChange={event => setStageDate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Row Number (optional)</label>
            <input
              type="number"
              value={rowNumber}
              onChange={event => setRowNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={2}
          />
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={formSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} />
            {formSubmitting ? 'Saving...' : 'Save Stage'}
          </button>
        </div>
      </form>

      {selectedStageName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Droplets size={16} />
            Spray programs matching: {selectedStageName}
          </div>
          {recommendedPrograms.length === 0 ? (
            <p className="text-sm text-blue-700 mt-2">No spray programs matched this stage.</p>
          ) : (
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              {recommendedPrograms.map(program => (
                <div key={program.id}>{program.name} · {program.stage || 'Stage not set'}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} className="text-gray-500" />
            Stage timeline
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterFieldId}
              onChange={event => setFilterFieldId(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All fields</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
            <select
              value={filterVariety}
              onChange={event => setFilterVariety(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All varieties</option>
              {varietyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {filteredRecords.length === 0 && (
            <p className="text-sm text-gray-500">No stage updates yet.</p>
          )}
          {filteredRecords.map(record => {
            const stage = stageById[record.stage_id];
            const field = record.field_id ? fields.find(f => f.id === record.field_id) : null;
            return (
              <div key={record.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{stage?.name || 'Stage'}</div>
                  <div className="text-xs text-gray-500">{record.stage_date}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {field ? `Field: ${field.name}` : 'Field: N/A'}
                  {record.variety ? ` • ${record.variety}` : ''}
                  {record.row_number ? ` • Row ${record.row_number}` : ''}
                </div>
                {record.notes && <div className="text-xs text-gray-500 mt-1">{record.notes}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
