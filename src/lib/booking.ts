import { supabase } from './supabase';

export interface BookingData {
  service_id: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  appointment_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
  payment_option: 'deposit' | 'full';
  amount_to_pay: number;
  remaining_balance: number;
}

export async function createBooking(data: BookingData) {
  // Generate the ID here so we never need to read the row back
  // This avoids needing SELECT permission for anonymous users
  const bookingId = crypto.randomUUID();

  const { error } = await supabase
    .from('bookings')
    .insert([{ id: bookingId, ...data }]);

  if (error) throw error;

  // We already know the ID — no SELECT needed
  return { id: bookingId };
}


export async function getUnavailableDates(): Promise<string[]> {
  // Get clinic settings
  const { data: settings } = await supabase
    .from('clinic_settings')
    .select('max_bookings_per_day, unavailable_dates')
    .single();

  const maxPerDay = settings?.max_bookings_per_day || 4;
  const manuallyBlocked: string[] = settings?.unavailable_dates || [];

  // Get all pending/confirmed bookings from today onwards
  const today = new Date().toISOString().split('T')[0];
  const { data: bookings } = await supabase
    .from('bookings')
    .select('appointment_date')
    .in('status', ['pending', 'confirmed'])
    .gte('appointment_date', today);

  // Count bookings per date
  const counts: Record<string, number> = {};
  bookings?.forEach((b) => {
    counts[b.appointment_date] = (counts[b.appointment_date] || 0) + 1;
  });

  // Dates that hit the cap
  const fullyBooked = Object.entries(counts)
    .filter(([_, count]) => count >= maxPerDay)
    .map(([date]) => date);

  // Combine manually blocked + fully booked, remove duplicates
  return [...new Set([...manuallyBlocked, ...fullyBooked])];
}