import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type StorageLocation = Database['public']['Tables']['storage_locations']['Row'];

type StorageLot = Database['public']['Tables']['storage_lots']['Row'];

type StorageMovement = Database['public']['Tables']['storage_movements']['Row'];

type StorageCondition = Database['public']['Tables']['storage_conditions']['Row'];

type StorageDamage = Database['public']['Tables']['storage_damage']['Row'];

export function useStorage() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [lots, setLots] = useState<StorageLot[]>([]);
  const [movements, setMovements] = useState<StorageMovement[]>([]);
  const [conditions, setConditions] = useState<StorageCondition[]>([]);
  const [damageLogs, setDamageLogs] = useState<StorageDamage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorage = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const [locationsRes, lotsRes, movementsRes, conditionsRes, damageRes] = await Promise.all([
        supabase.from('storage_locations').select('*').order('created_at', { ascending: false }),
        supabase.from('storage_lots').select('*').order('created_at', { ascending: false }),
        supabase.from('storage_movements').select('*').order('moved_at', { ascending: false }),
        supabase.from('storage_conditions').select('*').order('recorded_at', { ascending: false }),
        supabase.from('storage_damage').select('*').order('recorded_at', { ascending: false }),
      ]);

      if (locationsRes.error) throw locationsRes.error;
      if (lotsRes.error) throw lotsRes.error;
      if (movementsRes.error) throw movementsRes.error;
      if (conditionsRes.error) throw conditionsRes.error;
      if (damageRes.error) throw damageRes.error;

      setLocations(locationsRes.data || []);
      setLots(lotsRes.data || []);
      setMovements(movementsRes.data || []);
      setConditions(conditionsRes.data || []);
      setDamageLogs(damageRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const addLocation = async (payload: Database['public']['Tables']['storage_locations']['Insert']) => {
    try {
      const { data, error } = await (supabase as any)
        .from('storage_locations')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchStorage();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addLot = async (payload: Database['public']['Tables']['storage_lots']['Insert']) => {
    try {
      const { data, error } = await (supabase as any)
        .from('storage_lots')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchStorage();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addMovement = async (payload: Database['public']['Tables']['storage_movements']['Insert']) => {
    try {
      const { data, error } = await (supabase as any)
        .from('storage_movements')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchStorage();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addCondition = async (payload: Database['public']['Tables']['storage_conditions']['Insert']) => {
    try {
      const { data, error } = await (supabase as any)
        .from('storage_conditions')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchStorage();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addDamage = async (payload: Database['public']['Tables']['storage_damage']['Insert']) => {
    try {
      const { data, error } = await (supabase as any)
        .from('storage_damage')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchStorage();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    locations,
    lots,
    movements,
    conditions,
    damageLogs,
    loading,
    error,
    addLocation,
    addLot,
    addMovement,
    addCondition,
    addDamage,
    refetch: fetchStorage,
  };
}
