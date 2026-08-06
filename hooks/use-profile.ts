'use client';

import { useCallback, useEffect, useState } from 'react';
import { getProfileSnapshot, signOutProfile, updateProfile } from '@/lib/profile/repository';
import type { ProfileSnapshot, ProfileUpdate } from '@/types/profile';

export function useProfile(profileId?: string) {
  const [data, setData] = useState<ProfileSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setData(await getProfileSnapshot(profileId)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'PROFILE_DATA_UNAVAILABLE'); } finally { setLoading(false); } }, [profileId]);
  useEffect(() => { void load(); }, [load]);
  const save = useCallback(async (update: ProfileUpdate) => { if (!data || data.access !== 'owner') return; setSaving(true); setError(null); try { await updateProfile(data.profile.id, update); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.'); throw cause; } finally { setSaving(false); } }, [data, load]);
  return { data, loading, saving, error, retry: load, save, signOut: signOutProfile };
}
