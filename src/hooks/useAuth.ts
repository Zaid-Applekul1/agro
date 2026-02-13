import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string,
    phone?: string,
    khasra?: string,
    khata?: string,
    photoFile?: File
  ) => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured') };
    }

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user?.id) throw new Error('User creation failed');

      const userId = authData.user.id;
      let photoUrl: string | null = null;

      // 2. Upload photo with actual user ID (if provided)
      if (photoFile) {
        const { url, error: uploadError } = await uploadProfilePhoto(photoFile, userId);
        if (uploadError) {
          console.error('Photo upload failed:', uploadError);
          // Continue even if photo upload fails
        } else {
          photoUrl = url;
        }
      }

      // 3. Create user profile record
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          name: name || null,
          phone: phone || null,
          khasra: khasra || null,
          khata: khata || null,
          photograph_url: photoUrl || null,
          role: 'farmer',
        } as any);

      if (profileError) throw profileError;

      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Sign up failed')
      };
    }
  };

  const uploadProfilePhoto = async (file: File, userId: string) => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured'), url: null };
    }
    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('Farmer-Photographs')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('Farmer-Photographs')
        .getPublicUrl(fileName);
      
      return { error: null, url: publicUrl };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Upload failed'),
        url: null
      };
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    khasra?: string;
    khata?: string;
    photograph_url?: string;
  }) => {
    if (!supabaseConfigured || !user) {
      return { error: new Error('Not authenticated') };
    }
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { error };
  };

  const signOut = async () => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured') };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    uploadProfilePhoto,
    updateProfile,
  };
}
