import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && key);
export const supabase = supabaseReady ? createClient(url, key) : null;

export async function getSlotAvailability() {
  if (!supabaseReady) return null;
  const { data, error } = await supabase.from('service_slots').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function getMenuForDate(date) {
  if (!supabaseReady) return null;
  const { data, error } = await supabase.from('menus').select('*').eq('service_date', date).order('slot').order('id');
  if (error) throw error;
  return data;
}

export function subscribeToPortalChanges(onChange) {
  if (!supabaseReady) return () => {};
  const channel = supabase.channel('co-co-kitchen-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_slots' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
