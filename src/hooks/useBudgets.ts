import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Budget = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

type BudgetItem = Database['public']['Tables']['budget_items']['Row'];
type BudgetItemInsert = Database['public']['Tables']['budget_items']['Insert'];
type BudgetItemUpdate = Database['public']['Tables']['budget_items']['Update'];

type BudgetState = {
  budgets: Budget[];
  items: BudgetItem[];
};

export function useBudgets() {
  const [data, setData] = useState<BudgetState>({ budgets: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }
      setLoading(true);

      const [budgetsRes, itemsRes] = await Promise.all([
        supabase.from('budgets').select('*').order('start_date', { ascending: false }),
        supabase.from('budget_items').select('*').order('created_at', { ascending: false }),
      ]);

      if (budgetsRes.error) throw budgetsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setData({ budgets: budgetsRes.data || [], items: itemsRes.data || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = async (payload: BudgetInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('budgets')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateBudget = async (id: string, updates: BudgetUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addItem = async (payload: BudgetItemInsert) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('budget_items')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateItem = async (id: string, updates: BudgetItemUpdate) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase is not configured.' };
      }
      const { data, error } = await (supabase as any)
        .from('budget_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    budgets: data.budgets,
    items: data.items,
    loading,
    error,
    addBudget,
    updateBudget,
    addItem,
    updateItem,
    refetch: fetchBudgets,
  };
}
