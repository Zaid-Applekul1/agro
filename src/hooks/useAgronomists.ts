import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Agronomist, Booking, Recommendation, Treatment } from '../types';

type UserRole = 'farmer' | 'agronomist' | 'admin';

type CreateBookingInput = {
  agronomistId: string;
  orchardOwnerId: string;
  orchardId?: string | null;
  scheduledDate: string;
  notes: string;
  fee: number;
  problems?: string[];
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  orchardDetails?: unknown;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [errorObj.message, errorObj.details, errorObj.hint].filter(Boolean);
    if (parts.length > 0) {
      const codePrefix = errorObj.code ? `[${errorObj.code}] ` : '';
      return `${codePrefix}${parts.join(' | ')}`;
    }
  }
  return fallback;
};

const isSchemaMissingError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('does not exist') ||
    normalized.includes('could not find the table') ||
    normalized.includes('column') && normalized.includes('does not exist') ||
    normalized.includes('relation')
  );
};

const mapAgronomist = (row: any): Agronomist => ({
  id: row.id,
  userId: row.user_id ?? undefined,
  name: row.name ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  image: row.image_url ?? '',
  experience: Number(row.experience_years ?? 0),
  specializations: Array.isArray(row.specializations) ? row.specializations : [],
  qualifications: Array.isArray(row.qualifications) ? row.qualifications : [],
  regionCoverage: Array.isArray(row.region_coverage) ? row.region_coverage : [],
  verificationStatus: row.verification_status ?? 'pending',
  rating: Number(row.rating ?? 0),
  totalReviews: Number(row.total_reviews ?? 0),
  isActive: Boolean(row.is_active ?? true),
  createdAt: row.created_at ?? new Date().toISOString(),
  bio: row.bio ?? '',
  consultationFee: Number(row.consultation_fee ?? 0),
  rejectionReason: row.rejection_reason ?? undefined,
});

const mapBooking = (row: any): Booking => ({
  id: row.id,
  agronomistId: row.agronomist_id,
  orchardOwnerId: row.orchard_owner_id,
  orchardId: row.orchard_id ?? null,
  scheduledDate: row.scheduled_at,
  createdAt: row.created_at,
  status: row.status,
  notes: row.notes ?? '',
  fee: Number(row.fee ?? 0),
  problems: Array.isArray(row.problems) ? row.problems : [],
  paymentStatus: row.payment_status ?? 'unpaid',
  completedAt: row.completed_at ?? undefined,
});

const mapTreatment = (row: any): Treatment => ({
  id: row.id,
  bookingId: row.booking_id,
  agronomistId: row.agronomist_id,
  orchardId: row.orchard_id ?? null,
  recommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
  createdAt: row.created_at,
  submittedAt: row.submitted_at ?? undefined,
  status: row.status ?? 'submitted',
});

export function useAgronomists(userId?: string, roleHint?: string) {
  const [agronomists, setAgronomists] = useState<Agronomist[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [profileRole, setProfileRole] = useState<UserRole | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabaseConfigured || !userId) return;

    try {
      setLoading(true);
      setError(null);

      const [profileRes, agronomistsRes, bookingsRes, treatmentsRes] = await Promise.all([
        (supabase as any)
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle(),
        (supabase as any).from('agronomists').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('agronomist_bookings').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('agronomist_treatments').select('*').order('created_at', { ascending: false }),
      ]);

      if (profileRes.error) {
        const profileErrMsg = getErrorMessage(profileRes.error, '');
        const missingRoleColumn =
          profileErrMsg.toLowerCase().includes('column') &&
          profileErrMsg.toLowerCase().includes('role') &&
          profileErrMsg.toLowerCase().includes('does not exist');
        if (!missingRoleColumn) {
          throw profileRes.error;
        }
      }
      if (agronomistsRes.error) throw agronomistsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (treatmentsRes.error) throw treatmentsRes.error;

      if (profileRes.data?.role && ['farmer', 'agronomist', 'admin'].includes(profileRes.data.role)) {
        setProfileRole(profileRes.data.role as UserRole);
      } else {
        setProfileRole(null);
      }
      setSchemaReady(true);
      setAgronomists((agronomistsRes.data ?? []).map(mapAgronomist));
      setBookings((bookingsRes.data ?? []).map(mapBooking));
      setTreatments((treatmentsRes.data ?? []).map(mapTreatment));
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load agronomist data');
      if (isSchemaMissingError(message)) {
        setSchemaReady(false);
        setError(
          `Agronomist backend tables are missing. Run the migration ` +
            `supabase/migrations/20260213090000_agronomist_module.sql. Raw error: ${message}`
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentAgronomist = useMemo(
    () => agronomists.find((a) => a.userId === userId),
    [agronomists, userId]
  );

  const currentRole: UserRole = useMemo(() => {
    if (profileRole) {
      return profileRole;
    }
    if (roleHint === 'admin') {
      return 'admin';
    }
    if (currentAgronomist?.verificationStatus === 'approved') {
      return 'agronomist';
    }
    return 'farmer';
  }, [currentAgronomist, profileRole, roleHint]);

  const registerAgronomist = async (data: Partial<Agronomist>) => {
    if (!supabaseConfigured || !userId) {
      return { data: null, error: 'Supabase is not configured or user not authenticated.' };
    }
    try {
      const existing = agronomists.find((a) => a.userId === userId);
      if (existing && existing.verificationStatus === 'pending') {
        return { data: null, error: 'Your agronomist application is already pending admin approval.' };
      }

      const payload = {
        user_id: userId,
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        image_url: data.image ?? '',
        experience_years: data.experience ?? 0,
        bio: data.bio ?? '',
        consultation_fee: data.consultationFee ?? 0,
        specializations: data.specializations ?? [],
        region_coverage: data.regionCoverage ?? [],
        qualifications: data.qualifications ?? [],
        verification_status: 'pending',
        rating: 0,
        total_reviews: 0,
        is_active: true,
      };

      const { data: inserted, error } = await (supabase as any)
        .from('agronomists')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      await fetchData();
      return { data: mapAgronomist(inserted), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to register agronomist' };
    }
  };

  const approveAgronomist = async (id: string) => {
    if (!supabaseConfigured) return { error: 'Supabase is not configured.' };
    try {
      const { error } = await (supabase as any)
        .from('agronomists')
        .update({ verification_status: 'approved', rejection_reason: null })
        .eq('id', id);
      if (error) throw error;

      const approved = agronomists.find((a) => a.id === id);
      if (approved?.userId) {
        await (supabase as any)
          .from('user_profiles')
          .update({ role: 'agronomist' })
          .eq('user_id', approved.userId);
      }
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to approve agronomist' };
    }
  };

  const rejectAgronomist = async (id: string, reason: string) => {
    if (!supabaseConfigured) return { error: 'Supabase is not configured.' };
    try {
      const { error } = await (supabase as any)
        .from('agronomists')
        .update({ verification_status: 'rejected', rejection_reason: reason })
        .eq('id', id);
      if (error) throw error;

      const rejected = agronomists.find((a) => a.id === id);
      if (rejected?.userId) {
        await (supabase as any)
          .from('user_profiles')
          .update({ role: 'farmer' })
          .eq('user_id', rejected.userId);
      }
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to reject agronomist' };
    }
  };

  const createBooking = async (payload: CreateBookingInput) => {
    if (!supabaseConfigured || !userId) {
      return { data: null, error: 'Supabase is not configured or user not authenticated.' };
    }
    try {
      const insertPayload = {
        orchard_owner_id: payload.orchardOwnerId,
        agronomist_id: payload.agronomistId,
        orchard_id: payload.orchardId ?? null,
        scheduled_at: payload.scheduledDate,
        notes: payload.notes,
        fee: payload.fee,
        status: 'pending',
        problems: payload.problems ?? [],
        payment_status: payload.paymentStatus ?? 'unpaid',
        orchard_snapshot: payload.orchardDetails ?? null,
      };

      const { data: inserted, error } = await (supabase as any)
        .from('agronomist_bookings')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;
      await fetchData();
      return { data: mapBooking(inserted), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create booking' };
    }
  };

  const acceptBooking = async (bookingId: string) => {
    if (!supabaseConfigured) return { error: 'Supabase is not configured.' };
    try {
      const { error } = await (supabase as any)
        .from('agronomist_bookings')
        .update({ status: 'accepted' })
        .eq('id', bookingId);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to accept booking' };
    }
  };

  const createTreatment = async (bookingId: string, recommendations: Omit<Recommendation, 'id'>[]) => {
    if (!supabaseConfigured || !userId) {
      return { data: null, error: 'Supabase is not configured or user not authenticated.' };
    }
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      const agronomist = agronomists.find((a) => a.id === booking?.agronomistId);

      if (!booking || !agronomist) {
        return { data: null, error: 'Booking or agronomist not found.' };
      }

      const recommendationRows = recommendations.map((rec, index) => ({
        id: `${Date.now()}-${index + 1}`,
        ...rec,
      }));

      const payload = {
        booking_id: bookingId,
        agronomist_id: booking.agronomistId,
        orchard_id: booking.orchardId ?? null,
        recommendations: recommendationRows,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await (supabase as any)
        .from('agronomist_treatments')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const { error: bookingError } = await (supabase as any)
        .from('agronomist_bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('agronomist_id', agronomist.id);

      if (bookingError) throw bookingError;

      await fetchData();
      return { data: mapTreatment(inserted), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create treatment' };
    }
  };

  return {
    agronomists,
    bookings,
    treatments,
    loading,
    error,
    backendEnabled: supabaseConfigured && schemaReady,
    currentRole,
    currentAgronomist,
    registerAgronomist,
    approveAgronomist,
    rejectAgronomist,
    createBooking,
    acceptBooking,
    createTreatment,
    refetch: fetchData,
  };
}
