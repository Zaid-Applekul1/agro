import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

type RecurringSchedule = Database['public']['Tables']['recurring_schedules']['Row'];
type RecurringScheduleInsert = Database['public']['Tables']['recurring_schedules']['Insert'];
type RecurringScheduleUpdate = Database['public']['Tables']['recurring_schedules']['Update'];

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);

      const [eventsRes, schedulesRes] = await Promise.all([
        supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
        supabase.from('recurring_schedules').select('*').order('next_date', { ascending: true }),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (schedulesRes.error) throw schedulesRes.error;

      setEvents(eventsRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const addEvent = async (payload: CalendarEventInsert) => {
    try {
      const { data, error } = await (supabase as any)
        .from('calendar_events')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchCalendar();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateEvent = async (id: string, updates: CalendarEventUpdate) => {
    try {
      const { data, error } = await (supabase as any)
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchCalendar();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addSchedule = async (payload: RecurringScheduleInsert) => {
    try {
      const { data, error } = await (supabase as any)
        .from('recurring_schedules')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchCalendar();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateSchedule = async (id: string, updates: RecurringScheduleUpdate) => {
    try {
      const { data, error } = await (supabase as any)
        .from('recurring_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchCalendar();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    events,
    schedules,
    loading,
    error,
    addEvent,
    updateEvent,
    addSchedule,
    updateSchedule,
    refetch: fetchCalendar,
  };
}
