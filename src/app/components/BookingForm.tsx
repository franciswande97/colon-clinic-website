import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, step2Schema, step3Schema, bookingSchema } from '../../lib/validation';
import { X, Calendar, Clock, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { createBooking, getUnavailableDates } from '../../lib/booking.ts';
import { supabase } from '../../lib/supabase';
import FieldError from './ui/FieldError';

interface BookingFormProps {
  onClose: () => void;
}

export function BookingForm({ onClose }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    paymentOption: 'full',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  
  useEffect(() => {
    getUnavailableDates().then(setUnavailableDates);
  }, []);

  const {
    register,
    trigger,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur', // validates when user leaves a field
  });

  const services = [
    { id: 'initial', name: 'Initial Colon Hydrotherapy Consultation', price: 750 },
    { id: 'followup', name: 'Follow-up Session', price: 650 },
    { id: 'package4', name: 'Package x4 sessions', price: 2500 },
    { id: 'package6', name: 'Package of 6 sessions', price: 3750 },
    { id: 'massage60', name: 'Full Body Massage 60min', price: 550 },
    { id: 'massage30', name: '30min add on or half body massage', price: 350 },
  ];

  const getAvailableTimeSlots = () => {
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30'
    ];

    // If selected date is not today, all slots are available
    const today = new Date().toISOString().split('T')[0];
    if (formData.date !== today) return allSlots;

    // If today, filter out slots that have already passed
    // Add 30 min buffer so they can't book a slot starting in 5 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      if (slotHour > currentHour) return true;
      if (slotHour === currentHour && slotMinute > currentMinute) return true;
      return false;
    });
  };

  const selectedService = services.find(s => s.id === formData.service);

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extra check — block unavailable dates even if zod passes
    if (step === 1 && unavailableDates.includes(formData.date)) {
      setDateError('This date is fully booked or unavailable. Please choose another date.');
      return;
    }

    const fieldsToValidate = step === 1
      ? ['service', 'date', 'time'] as const
      : ['firstName', 'lastName', 'email', 'phone', 'notes'] as const;

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    setStep(prev => prev + 1);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-2xl">Book Your Appointment</h2>
            <p className="text-sm opacity-90 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-primary-foreground/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleStepSubmit} className="p-6">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-4">Select a Service</h3>
                <div className="space-y-3">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.service === service.id
                          ? 'border-primary bg-secondary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={formData.service === service.id}
                        onChange={(e) => {
                          updateFormData('service', e.target.value);
                          setValue('service', e.target.value);
                        }}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">{service.name}</span>
                        <span className="text-primary">R{service.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-foreground">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    value={formData.date}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      setFormData(prev => ({ ...prev, date: selectedDate }));
                      setValue('date', selectedDate);

                      // Check if selected date is unavailable
                      if (unavailableDates.includes(selectedDate)) {
                        setDateError('This date is fully booked or unavailable. Please choose another date.');
                      } else {
                        setDateError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {/* Show date-specific error */}
                  {dateError && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {dateError}
                    </p>
                  )}
                  {/* Show zod validation error */}
                  <FieldError message={!dateError ? errors.date?.message : undefined} />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Preferred Time
                  </label>
                  {getAvailableTimeSlots().length === 0 ? (
                    <p className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">
                      No available slots for today. Please select a future date.
                    </p>
                  ) : (
                    <select
                      value={formData.time}
                      onChange={(e) => {
                        updateFormData('time', e.target.value);
                        setValue('time', e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-md border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  )}
                  <FieldError message={errors.time?.message} />
                </div>

              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl text-primary mb-4">Your Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-foreground">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register('firstName')}
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, firstName: e.target.value }));
                      setValue('firstName', e.target.value);
                    }}
                    className="..."
                  />
                  <FieldError message={errors.firstName?.message} />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, lastName: e.target.value }));
                      setValue('lastName', e.target.value);
                    }}
                    className="..."
                  />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-foreground">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    setValue('email', e.target.value);
                  }}
                  className="..."
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div>
                <label className="block mb-2 text-foreground">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }));
                    setValue('phone', e.target.value);
                  }}
                  placeholder="0821234567"
                  className="..."
                />
                <FieldError message={errors.phone?.message} />
              </div>

              <div>
                <label className="block mb-2 text-foreground">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, notes: e.target.value }));
                    setValue('notes', e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-md border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring h-24"
                  placeholder="Any health concerns, allergies, or special requests..."
                ></textarea>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> Please inform us of any medical conditions, recent surgeries, or contraindications before your appointment.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl text-primary mb-4">Payment & Confirmation</h3>

              {/* Booking Summary */}
              <div className="bg-secondary p-6 rounded-lg">
                <h4 className="text-lg text-primary mb-4">Booking Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="text-foreground">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-foreground">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="text-foreground">{formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{formData.phone}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Service Total:</span>
                      <span className="text-foreground">R{selectedService?.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-primary">Amount to Pay Now:</span>
                      <span className="text-2xl text-primary">
                        R{formData.paymentOption === 'deposit'
                          ? Math.round((selectedService?.price || 0) * 0.5)
                          : selectedService?.price}
                      </span>
                    </div>
                    {formData.paymentOption === 'deposit' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Remaining balance (R{Math.round((selectedService?.price || 0) * 0.5)}) due at the clinic
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Option Selection */}
              <div className="space-y-3">
                <h4 className="text-lg text-primary">Choose Payment Option</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <label
                    className={`block p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentOption === 'deposit'
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="deposit"
                      checked={formData.paymentOption === 'deposit'}
                      onChange={(e) => updateFormData('paymentOption', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        formData.paymentOption === 'deposit'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {formData.paymentOption === 'deposit' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-foreground mb-1">50% Deposit</div>
                        <div className="text-sm text-muted-foreground">
                          Pay R{selectedService ? Math.round(selectedService.price * 0.5) : 0} now · Pay remaining R{selectedService ? Math.round(selectedService.price * 0.5) : 0} on arrival
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentOption === 'full'
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={formData.paymentOption === 'full'}
                      onChange={(e) => updateFormData('paymentOption', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        formData.paymentOption === 'full'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {formData.paymentOption === 'full' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-foreground mb-1">100% Full Payment</div>
                        <div className="text-sm text-muted-foreground">
                          Pay R{selectedService?.price || 0} now · Nothing due on arrival
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl text-primary mb-2">
                    R{formData.paymentOption === 'deposit'
                      ? Math.round((selectedService?.price || 0) * 0.5)
                      : selectedService?.price || 0}
                  </div>
                  <div className="text-lg text-foreground mb-3">Amount due today</div>
                  <div className="text-sm text-muted-foreground">
                    {formData.paymentOption === 'deposit' ? (
                      <>Remaining balance due at clinic: R{Math.round((selectedService?.price || 0) * 0.5)}</>
                    ) : (
                      <>Full payment — nothing due at clinic</>
                    )}
                  </div>
                </div>
              </div>

              {/* Secure Payment Button */}
              <div>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 text-lg"
                  onClick={async () => {
                    // Validate checkbox manually since button is type="button"
                    if (!agreedToTerms) {
                      setError('Please confirm you have no contraindications before proceeding.');
                      return;
                    }

                    setIsLoading(true);
                    setError(null);

                    try {
                      const amountToPay = formData.paymentOption === 'deposit'
                        ? Math.round((selectedService?.price || 0) * 0.5)
                        : selectedService?.price || 0;

                      const remainingBalance = formData.paymentOption === 'deposit'
                        ? Math.round((selectedService?.price || 0) * 0.5)
                        : 0;

                      const booking = await createBooking({
                        service_id:       formData.service,
                        service_name:     selectedService?.name || '',
                        service_price:    selectedService?.price || 0,
                        appointment_date: formData.date,
                        appointment_time: formData.time,
                        first_name:       formData.firstName,
                        last_name:        formData.lastName,
                        email:            formData.email,
                        phone:            formData.phone,
                        notes:            formData.notes,
                        payment_option:   formData.paymentOption as 'deposit' | 'full',
                        amount_to_pay:    amountToPay,
                        remaining_balance: remainingBalance,
                      });

                      // Call Edge Function to get signed PayFast data
                      const { data: paymentData, error: fnError } = await supabase.functions.invoke(
                        'generate-payfast-signature',
                        {
                          body: {
                            bookingId:   booking.id,
                            amountToPay: amountToPay,
                            serviceName: selectedService?.name || '',
                            firstName:   formData.firstName,
                            lastName:    formData.lastName,
                            email:       formData.email,
                          },
                        }
                      );

                      if (fnError) throw fnError;

                      // Build a hidden form and submit to PayFast
                      // This is the correct way — PayFast requires a POST
                      const form = document.createElement('form');
                      form.method = 'POST';
                      form.action = import.meta.env.VITE_PAYFAST_URL;

                      Object.entries(paymentData as Record<string, string>).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type  = 'hidden';
                        input.name  = key;
                        input.value = value;
                        form.appendChild(input);
                      });

                      document.body.appendChild(form);
                      form.submit(); // User is now redirected to PayFast

                    } catch (err: any) {
                      console.error('Booking error:', err);

                      // Check for specific Supabase error messages
                      const message = err?.message || err?.error_description || '';

                      if (message.includes('fully booked')) {
                        setError('Sorry, this date is now fully booked. Please go back and choose a different date.');
                      } else if (message.includes('Too many bookings')) {
                        setError('You have too many recent bookings. Please try again in an hour.');
                      } else {
                        setError('Something went wrong saving your booking. Please try again.');
                      }
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <Lock className="w-5 h-5" />
                  {isLoading ? 'Saving your booking...' : 'Proceed to Secure Payment via PayFast'}
                </button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  You will be securely redirected to PayFast to complete your payment. We never store your card details.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Contraindications checkbox */}
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                />
                <label className="text-sm text-foreground">
                  I understand and agree that I do not have any contraindications for colon hydrotherapy
                  and confirm that the information provided is accurate. I agree to the clinic's terms and conditions.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                type="submit"
                disabled={step === 1 && (!formData.service || !formData.date || !formData.time)}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
