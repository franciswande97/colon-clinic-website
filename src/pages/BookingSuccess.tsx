import { Calendar } from 'lucide-react';

export default function BookingSuccess() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id');
  const serviceName = params.get('serviceName') ?? 'Appointment';
  const appointmentDate = params.get('date') ?? '';
  const appointmentTime = params.get('time') ?? '';

  function generateCalendarLink(booking: {
    serviceName: string;
    date: string;
    time: string;
    duration?: number;
  }) {
    const startDate = new Date(`${booking.date}T${booking.time}:00`);
    const endDate = new Date(startDate.getTime() + (booking.duration || 60) * 60000);

    const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${booking.serviceName} — The Colon Clinic`,
      dates: `${format(startDate)}/${format(endDate)}`,
      details: 'Your appointment at The Colon Clinic. Please arrive 5 minutes early.',
      location: 'The Colon Clinic, Port Elizabeth',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your payment was successful and your appointment has been booked. 
          You will receive a confirmation email shortly.
        </p>
        {bookingId && (
          <p className="text-sm text-muted-foreground">
            Booking reference: <span className="font-mono font-medium">{bookingId}</span>
          </p>
        )}
        <a
          href={generateCalendarLink({
            serviceName,
            date: appointmentDate,
            time: appointmentTime,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Add to Google Calendar
        </a> 

        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );

}
