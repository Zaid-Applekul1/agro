import { useMemo, useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { Calendar, CheckCircle2, Circle, Filter, Plus, Trash2 } from 'lucide-react';

const taskTypeOptions = [
  { value: 'digging', label: 'Digging' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'spray', label: 'Spray' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'fertilizing', label: 'Fertilizing' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'thinning', label: 'Thinning' },
  { value: 'scouting', label: 'Scouting' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

export function ActivityManagement() {
  const { activities, loading, error, addActivity, updateActivity, deleteActivity } = useActivities();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const [formTitle, setFormTitle] = useState('');
  const [formTaskType, setFormTaskType] = useState('digging');
  const [formCustomType, setFormCustomType] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (filterStatus === 'all') return true;
      return activity.status === filterStatus;
    });
  }, [activities, filterStatus]);

  const pendingCount = activities.filter(a => a.status === 'pending').length;
  const completedCount = activities.filter(a => a.status === 'completed').length;

  const resetForm = () => {
    setFormTitle('');
    setFormTaskType('digging');
    setFormCustomType('');
    setFormDueDate('');
    setFormNotes('');
    setFormError(null);
  };

  const handleAddActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const taskType = formTaskType === 'other' ? formCustomType.trim() : formTaskType;

    if (!formTitle.trim()) {
      setFormError('Task name is required.');
      return;
    }

    if (formTaskType === 'other' && !taskType) {
      setFormError('Please enter a task type.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addActivity({
      title: formTitle.trim(),
      task_type: taskType,
      due_date: formDueDate || null,
      notes: formNotes.trim() || null,
      status: 'pending',
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetForm();
    setShowAddForm(false);
  };

  const toggleStatus = async (id: string, status: string) => {
    const nextStatus = status === 'completed' ? 'pending' : 'completed';
    await updateActivity(id, {
      status: nextStatus,
      completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
    });
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
        <p className="text-red-800">Error loading activities: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Planner</h2>
          <p className="text-sm text-gray-600 mt-1">Plan tasks like pruning, irrigation, and spray schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium">Total Tasks</p>
          <p className="text-2xl font-bold text-blue-800">{activities.length}</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-800">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterStatus}
              onChange={event => setFilterStatus(event.target.value as typeof filterStatus)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivities.map(activity => (
          <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleStatus(activity.id, activity.status || 'pending')}
                className="mt-1 text-green-600 hover:text-green-700"
                aria-label="Toggle status"
              >
                {activity.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div>
                <h3 className={`font-medium ${activity.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">{activity.task_type}</p>
                {activity.notes && (
                  <p className="text-sm text-gray-500 mt-1">{activity.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {activity.due_date && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{new Date(activity.due_date).toLocaleDateString()}</span>
                </div>
              )}
              <button
                onClick={() => deleteActivity(activity.id)}
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 size={16} />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-600">
            <p className="font-medium">No tasks found.</p>
            <p className="text-sm mt-1">Add a task to start planning your work.</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Activity</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleAddActivity}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={event => setFormTitle(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                    <select
                      value={formTaskType}
                      onChange={event => setFormTaskType(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {taskTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={event => setFormDueDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {formTaskType === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Task Type</label>
                    <input
                      type="text"
                      value={formCustomType}
                      onChange={event => setFormCustomType(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={event => setFormNotes(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
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
                    {formSubmitting ? 'Saving...' : 'Add Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
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
    </div>
  );
}
