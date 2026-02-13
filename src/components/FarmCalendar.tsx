import { useMemo, useState, type FormEvent } from 'react';
import { useActivities } from '../hooks/useActivities';
import { useCalendar } from '../hooks/useCalendar';
import { useEquipment } from '../hooks/useEquipment';
import { useFields } from '../hooks/useFields';
import { useInventory } from '../hooks/useInventory';
import { usePestTreatments } from '../hooks/usePestTreatments';
import { Bell, CalendarDays, Plus, Repeat } from 'lucide-react';

type CalendarItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  source: string;
  reminderChannel?: string | null;
  notes?: string | null;
};

const categoryLabels: Record<string, string> = {
  activity: 'Activity',
  spray: 'Spray',
  fertilizer: 'Fertilizer',
  service: 'Service',
  visit: 'Expert Visit',
  inventory: 'Inventory',
  other: 'Other',
};

const reminderOptions = [
  { value: 'in_app', label: 'In-app' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export function FarmCalendar() {
  const { activities } = useActivities();
  const { equipment } = useEquipment();
  const { inventory } = useInventory();
  const { pestTreatments } = usePestTreatments();
  const { fields } = useFields();
  const { events, schedules, loading, error, addEvent, addSchedule, updateEvent, updateSchedule } = useCalendar();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [filterRange, setFilterRange] = useState<'upcoming' | 'all'>('upcoming');

  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('activity');
  const [eventDate, setEventDate] = useState('');
  const [eventReminderDays, setEventReminderDays] = useState('2');
  const [eventReminderChannel, setEventReminderChannel] = useState('in_app');
  const [eventNotes, setEventNotes] = useState('');

  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleCategory, setScheduleCategory] = useState('spray');
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleInterval, setScheduleInterval] = useState('1');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleReminderDays, setScheduleReminderDays] = useState('2');
  const [scheduleReminderChannel, setScheduleReminderChannel] = useState('in_app');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const upcomingCutoff = useMemo(() => addDays(new Date(), 30), []);

  const systemEvents = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = [];

    activities.forEach(activity => {
      if (!activity.due_date) return;
      items.push({
        id: `activity-${activity.id}`,
        title: activity.title,
        date: activity.due_date,
        category: 'activity',
        source: 'Activity',
      });
    });

    equipment.forEach(item => {
      if (!item.next_service) return;
      items.push({
        id: `service-${item.id}`,
        title: `${item.name} service due`,
        date: item.next_service,
        category: 'service',
        source: 'Equipment',
      });
    });

    inventory.forEach(item => {
      if (!item.expiry_date) return;
      items.push({
        id: `inventory-${item.id}`,
        title: `${item.name} expiry`,
        date: item.expiry_date,
        category: 'inventory',
        source: 'Inventory',
      });
    });

    pestTreatments.forEach(treatment => {
      if (!treatment.next_treatment_due) return;
      items.push({
        id: `spray-${treatment.id}`,
        title: `${treatment.chemical} follow-up`,
        date: treatment.next_treatment_due,
        category: 'spray',
        source: 'Pest Control',
      });
    });

    fields.forEach(field => {
      (field.fertilizer_applications || []).forEach(application => {
        items.push({
          id: `fert-${application.id}`,
          title: `${field.name} fertilizer ${application.type}`,
          date: application.application_date,
          category: 'fertilizer',
          source: 'Fertilizer',
        });
      });
    });

    return items;
  }, [activities, equipment, inventory, pestTreatments, fields]);

  const customEvents = useMemo<CalendarItem[]>(() => {
    return events
      .filter(event => event.status !== 'completed')
      .map(event => ({
      id: event.id,
      title: event.title,
      date: event.event_date,
      category: event.category,
      source: 'Manual',
      reminderChannel: event.reminder_channel,
      notes: event.notes,
      }));
  }, [events]);

  const scheduleEvents = useMemo<CalendarItem[]>(() => {
    return schedules.map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      date: schedule.next_date,
      category: schedule.category,
      source: 'Recurring',
      reminderChannel: schedule.reminder_channel,
      notes: schedule.notes,
    }));
  }, [schedules]);

  const combinedEvents = useMemo<CalendarItem[]>(() => {
    const all = [...customEvents, ...scheduleEvents, ...systemEvents];
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, scheduleEvents, systemEvents]);

  const filteredEvents = useMemo(() => {
    if (filterRange === 'all') return combinedEvents;
    const today = toDateOnly(new Date());
    return combinedEvents.filter(item => {
      const eventDate = toDateOnly(new Date(item.date));
      return eventDate >= today && eventDate <= toDateOnly(upcomingCutoff);
    });
  }, [combinedEvents, filterRange, upcomingCutoff]);

  const reminders = useMemo(() => {
    const today = toDateOnly(new Date());
    return filteredEvents.filter(item => {
      const eventDate = toDateOnly(new Date(item.date));
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
  }, [filteredEvents]);

  const resetEventForm = () => {
    setEventTitle('');
    setEventCategory('activity');
    setEventDate('');
    setEventReminderDays('2');
    setEventReminderChannel('in_app');
    setEventNotes('');
    setFormError(null);
  };

  const resetScheduleForm = () => {
    setScheduleTitle('');
    setScheduleCategory('spray');
    setScheduleFrequency('weekly');
    setScheduleInterval('1');
    setScheduleStartDate('');
    setScheduleReminderDays('2');
    setScheduleReminderChannel('in_app');
    setScheduleNotes('');
    setFormError(null);
  };

  const handleAddEvent = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!eventTitle.trim() || !eventDate) {
      setFormError('Title and date are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addEvent({
      title: eventTitle.trim(),
      category: eventCategory,
      event_date: eventDate,
      reminder_days_before: Number(eventReminderDays || 2),
      reminder_channel: eventReminderChannel,
      notes: eventNotes.trim() || null,
      status: 'scheduled',
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetEventForm();
    setShowEventForm(false);
  };

  const handleAddSchedule = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!scheduleTitle.trim() || !scheduleStartDate) {
      setFormError('Title and start date are required.');
      return;
    }

    const intervalValue = Number(scheduleInterval || 1);
    if (!intervalValue || intervalValue < 1) {
      setFormError('Interval must be at least 1.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addSchedule({
      title: scheduleTitle.trim(),
      category: scheduleCategory,
      frequency: scheduleFrequency,
      interval_value: intervalValue,
      start_date: scheduleStartDate,
      next_date: scheduleStartDate,
      reminder_days_before: Number(scheduleReminderDays || 2),
      reminder_channel: scheduleReminderChannel,
      notes: scheduleNotes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetScheduleForm();
    setShowScheduleForm(false);
  };

  const advanceSchedule = async (id: string, nextDate: string, frequency: string, intervalValue: number | null) => {
    const baseDate = new Date(nextDate);
    const interval = intervalValue || 1;
    let updatedDate = baseDate;

    if (frequency === 'daily') {
      updatedDate = addDays(baseDate, interval);
    } else if (frequency === 'weekly') {
      updatedDate = addDays(baseDate, interval * 7);
    } else {
      updatedDate = addMonths(baseDate, interval);
    }

    await updateSchedule(id, { next_date: toISODate(updatedDate) });
  };

  const markEventDone = async (id: string) => {
    await updateEvent(id, { status: 'completed' });
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
        <p className="text-red-800">Error loading calendar: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farm Calendar & Reminders</h2>
          <p className="text-sm text-gray-600 mt-1">Central schedule for orchard operations and maintenance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Event</span>
          </button>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Repeat size={16} />
            <span>Add Recurring</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium">Total Events</p>
          <p className="text-2xl font-bold text-blue-800">{combinedEvents.length}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 font-medium">Upcoming 30 Days</p>
          <p className="text-2xl font-bold text-amber-800">{filteredEvents.length}</p>
        </div>
        <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
          <p className="text-rose-700 font-medium">Reminders (7 Days)</p>
          <p className="text-2xl font-bold text-rose-800">{reminders.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRange('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRange === 'upcoming' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming 30 Days
          </button>
          <button
            onClick={() => setFilterRange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRange === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
            <Bell size={18} className="text-gray-500" />
          </div>
          <div className="mt-3 space-y-3">
            {reminders.length === 0 && (
              <p className="text-sm text-gray-500">No reminders due in the next 7 days.</p>
            )}
            {reminders.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{categoryLabels[item.category] || item.category}</p>
                <p className="text-xs text-gray-500">Due: {new Date(item.date).toLocaleDateString()}</p>
                {item.reminderChannel && (
                  <p className="text-xs text-gray-500">Reminder: {item.reminderChannel}</p>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">Email reminders require backend mail setup.</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
            <CalendarDays size={18} className="text-gray-500" />
          </div>
          <div className="mt-3 space-y-3">
            {filteredEvents.length === 0 && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600">
                <p className="font-medium">No events scheduled.</p>
                <p className="text-sm mt-1">Add events or recurring schedules to get reminders.</p>
              </div>
            )}
            {filteredEvents.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{categoryLabels[item.category] || item.category} · {item.source}</p>
                  {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  {item.source === 'Manual' && (
                    <button
                      onClick={() => markEventDone(item.id)}
                      className="text-sm text-green-700 hover:text-green-900"
                    >
                      Mark done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recurring Schedules</h3>
          <Repeat size={18} className="text-gray-500" />
        </div>
        <div className="mt-3 space-y-3">
          {schedules.length === 0 && (
            <p className="text-sm text-gray-500">No recurring schedules added.</p>
          )}
          {schedules.map(schedule => (
            <div key={schedule.id} className="border border-gray-200 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{schedule.title}</p>
                <p className="text-sm text-gray-600">
                  {categoryLabels[schedule.category] || schedule.category} · {schedule.frequency} every {schedule.interval_value || 1}
                </p>
                {schedule.notes && <p className="text-xs text-gray-500 mt-1">{schedule.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Next</p>
                  <p className="text-sm text-gray-900">{new Date(schedule.next_date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => advanceSchedule(schedule.id, schedule.next_date, schedule.frequency, schedule.interval_value)}
                  className="text-sm text-blue-700 hover:text-blue-900"
                >
                  Mark done
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Calendar Event</h3>
                <button onClick={() => setShowEventForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddEvent}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={event => setEventTitle(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={eventCategory}
                      onChange={event => setEventCategory(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={event => setEventDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days Before</label>
                    <input
                      type="number"
                      value={eventReminderDays}
                      onChange={event => setEventReminderDays(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Channel</label>
                    <select
                      value={eventReminderChannel}
                      onChange={event => setEventReminderChannel(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {reminderOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={eventNotes}
                    onChange={event => setEventNotes(event.target.value)}
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
                    {formSubmitting ? 'Saving...' : 'Add Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      resetEventForm();
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

      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Recurring Schedule</h3>
                <button onClick={() => setShowScheduleForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleAddSchedule}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={event => setScheduleTitle(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={scheduleCategory}
                      onChange={event => setScheduleCategory(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="spray">Spray</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="service">Service</option>
                      <option value="visit">Expert Visit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={scheduleFrequency}
                      onChange={event => setScheduleFrequency(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Every</label>
                    <input
                      type="number"
                      value={scheduleInterval}
                      onChange={event => setScheduleInterval(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={scheduleStartDate}
                      onChange={event => setScheduleStartDate(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days Before</label>
                    <input
                      type="number"
                      value={scheduleReminderDays}
                      onChange={event => setScheduleReminderDays(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Channel</label>
                    <select
                      value={scheduleReminderChannel}
                      onChange={event => setScheduleReminderChannel(event.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {reminderOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={scheduleNotes}
                    onChange={event => setScheduleNotes(event.target.value)}
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
                    {formSubmitting ? 'Saving...' : 'Add Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      resetScheduleForm();
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
