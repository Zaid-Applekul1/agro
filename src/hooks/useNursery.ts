import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type NurserySupplier = Database['public']['Tables']['nursery_suppliers']['Row'];
type NurserySupplierInsert = Database['public']['Tables']['nursery_suppliers']['Insert'];
type NurserySupplierUpdate = Database['public']['Tables']['nursery_suppliers']['Update'];

type NurseryBatch = Database['public']['Tables']['nursery_batches']['Row'];
type NurseryBatchInsert = Database['public']['Tables']['nursery_batches']['Insert'];
type NurseryBatchUpdate = Database['public']['Tables']['nursery_batches']['Update'];

type TreeMortality = Database['public']['Tables']['tree_mortality']['Row'];
type TreeMortalityInsert = Database['public']['Tables']['tree_mortality']['Insert'];
type TreeMortalityUpdate = Database['public']['Tables']['tree_mortality']['Update'];

type NurseryState = {
  suppliers: NurserySupplier[];
  batches: NurseryBatch[];
  mortality: TreeMortality[];
};

export function useNursery() {
  const [data, setData] = useState<NurseryState>({ suppliers: [], batches: [], mortality: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserId = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return null;
    return session?.user?.id ?? null;
  };

  const fetchData = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      const userId = await getUserId();
      if (!userId) {
        setData({ suppliers: [], batches: [], mortality: [] });
        setLoading(false);
        return;
      }
      setLoading(true);

      const [suppliersRes, batchesRes, mortalityRes] = await Promise.all([
        supabase.from('nursery_suppliers').select('*').order('name', { ascending: true }),
        supabase.from('nursery_batches').select('*').order('purchase_date', { ascending: false }),
        supabase.from('tree_mortality').select('*').order('death_date', { ascending: false }),
      ]);

      if (suppliersRes.error) throw suppliersRes.error;
      if (batchesRes.error) throw batchesRes.error;
      if (mortalityRes.error) throw mortalityRes.error;

      setData({
        suppliers: suppliersRes.data || [],
        batches: batchesRes.data || [],
        mortality: mortalityRes.data || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Supplier operations
  const addSupplier = async (payload: NurserySupplierInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add suppliers.' };
      }
      const { data, error } = await (supabase as any)
        .from('nursery_suppliers')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateSupplier = async (id: string, updates: NurserySupplierUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('nursery_suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.' };
      }
      const { error } = await supabase.from('nursery_suppliers').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  // Batch operations
  const addBatch = async (payload: NurseryBatchInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add batches.' };
      }
      const { data, error } = await (supabase as any)
        .from('nursery_batches')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateBatch = async (id: string, updates: NurseryBatchUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('nursery_batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.' };
      }
      const { error } = await supabase.from('nursery_batches').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  // Mortality operations
  const addMortality = async (payload: TreeMortalityInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const userId = await getUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to add mortality records.' };
      }
      const { data: mortalityRecord, error } = await (supabase as any)
        .from('tree_mortality')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) throw error;

      // Update batch mortality count and survival rate if linked
      if (payload.nursery_batch_id) {
        const batch = data.batches.find((b: NurseryBatch) => b.id === payload.nursery_batch_id);
        if (batch) {
          const newMortalityCount = (batch.mortality_count || 0) + 1;
          const survivedCount = (batch.planted_count || 0) - newMortalityCount;
          const survivalRate = batch.planted_count ? (survivedCount / batch.planted_count * 100) : 0;
          
          await updateBatch(payload.nursery_batch_id, {
            mortality_count: newMortalityCount,
            survived_count: survivedCount,
            survival_rate: Number(survivalRate.toFixed(2)),
          });
        }
      }

      await fetchData();
      return { data: mortalityRecord, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateMortality = async (id: string, updates: TreeMortalityUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await supabase
        .from('tree_mortality')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteMortality = async (id: string) => {
    try {
      if (!supabaseConfigured) {
        return { error: 'Supabase is not configured.' };
      }
      const { error } = await supabase.from('tree_mortality').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    suppliers: data.suppliers,
    batches: data.batches,
    mortality: data.mortality,
    loading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addBatch,
    updateBatch,
    deleteBatch,
    addMortality,
    updateMortality,
    deleteMortality,
    refetch: fetchData,
  };
}
