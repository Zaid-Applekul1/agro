import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type MasterSuggestion = Database['public']['Tables']['master_suggestions']['Row'];
type SuggestionType = 'crop' | 'variety' | 'chemical' | 'fertilizer' | 'unit' | 'region' | 'supplier';

export function useMasterSuggestions() {
  const [suggestions, setSuggestions] = useState<MasterSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      if (!supabaseConfigured) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('master_suggestions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSuggestions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const addSuggestion = async (
    type: SuggestionType,
    title: string,
    suggestedValue: string,
    category?: string,
    description?: string
  ) => {
    try {
      if (!supabaseConfigured) {
        return { data: null, error: 'Supabase not configured' };
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        return { data: null, error: 'Not authenticated' };
      }

      const { data, error: insertError } = await supabase
        .from('master_suggestions')
        .insert([
          {
            user_id: session.user.id,
            suggestion_type: type,
            title,
            suggested_value: suggestedValue,
            category: category || null,
            description: description || null,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchSuggestions();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    suggestions,
    loading,
    error,
    addSuggestion,
    refetch: fetchSuggestions,
  };
}
