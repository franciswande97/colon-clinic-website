import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  Calendar, CheckCircle, Clock, XCircle,
  LogOut, TrendingUp, Users, DollarSign, RefreshCw
} from 'lucide-react';

interface Booking {
  id: string;
  created_at: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  payment_option: 'deposit' | 'full';
  amount_to_pay: number;
  remaining_balance: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(4);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (data) {
      setMaxBookingsPerDay(data.max_bookings_per_day);
      setBlockedDates(data.unavailable_dates || []);
    }
  };

  const saveSettings = async () => {
    await supabase
      .from('clinic_settings')
      .update({
        max_bookings_per_day: maxBookingsPerDay,
        unavailable_dates: blockedDates,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    alert('Settings saved.');
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
  };

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    // Real-time subscription — dashboard updates instantly when new booking arrives
    const subscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => fetchBookings())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (!error) fetchBookings();
  };

  // Stats calculated from live data
  const confirmed  = bookings.filter(b => b.status === 'confirmed');
  const pending    = bookings.filter(b => b.status === 'pending');
  const completed  = bookings.filter(b => b.status === 'completed');
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.amount_to_pay, 0);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Top Navigation */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">The Colon Clinic</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <main className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Confirmed Bookings',
              value: confirmed.length,
              icon: CheckCircle,
              color: 'text-green-600',
              bg: 'bg-green-50'
            },
            {
              label: 'Pending Payment',
              value: pending.length,
              icon: Clock,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50'
            },
            {
              label: 'Completed Sessions',
              value: completed.length,
              icon: Users,
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            {
              label: 'Revenue Collected',
              value: `R${totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: 'text-primary',
              bg: 'bg-primary/10'
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Settings Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Availability Settings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Max bookings per day */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Maximum bookings per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxBookingsPerDay}
                  onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              {/* Block a date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Block out a date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                  />
                  <button
                    onClick={addBlockedDate}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Block
                  </button>
                </div>

                {/* Blocked dates list */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {blockedDates.map(date => (
                    <span
                      key={date}
                      className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                    >
                      {date}
                      <button
                        onClick={() => removeBlockedDate(date)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Save Settings
            </button>
          </div>

          {/* Table Header */}
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              All Bookings
            </h2>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchBookings}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    {['Customer', 'Service', 'Appointment', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-muted/30 transition-colors">

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {booking.first_name} {booking.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.email}</p>
                        <p className="text-xs text-muted-foreground">{booking.phone}</p>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3">
                        <p className="text-foreground">{booking.service_name}</p>
                      </td>

                      {/* Appointment */}
                      <td className="px-4 py-3">
                        <p className="text-foreground">{booking.appointment_date}</p>
                        <p className="text-xs text-muted-foreground">{booking.appointment_time}</p>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          R{booking.amount_to_pay.toLocaleString()} paid
                        </p>
                        {booking.remaining_balance > 0 && (
                          <p className="text-xs text-yellow-600">
                            R{booking.remaining_balance.toLocaleString()} due at clinic
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">
                          {booking.payment_option === 'deposit' ? '50% deposit' : 'Full payment'}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}