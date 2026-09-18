import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_COKITBASE_URL;
const key = import.meta.env.VITE_COKITBASE_ANON_KEY;

export const cokitbaseReady = Boolean(url && key);
export const cokitbase = cokitbaseReady ? createClient(url, key) : null;

export async function getSlotAvailability() {
  if (!cokitbaseReady) return null;
  const { data, error } = await cokitbase.from('service_slots').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function getMenuForDate(date) {
  if (!cokitbaseReady) return null;
  const { data, error } = await cokitbase.from('menus').select('*').eq('service_date', date).order('slot').order('id');
  if (error) throw error;
  return data;
}

export function subscribeToPortalChanges(onChange) {
  if (!cokitbaseReady) return () => {};
  const channel = cokitbase.channel('co-co-kitchen-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_slots' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, onChange)
    .subscribe();
  return () => { cokitbase.removeChannel(channel); };
}
