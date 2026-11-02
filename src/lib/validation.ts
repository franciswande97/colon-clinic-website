import { z } from 'zod';

// Step 1 — Service & Appointment
export const step1Schema = z.object({
  service: z.string().min(1, 'Please select a service'),
  date: z.string()
    .min(1, 'Please select a date')
    .refine((val) => {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Appointment date cannot be in the past'),
  time: z.string()
    .min(1, 'Please select a time')
    .refine((val) => {
      // Will be cross-validated with date in the form
      return val !== '';
    }, 'Please select a time'),
});

// Step 2 — Personal Information
export const step2Schema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+27|0)[6-8][0-9]{8}$/,
      'Please enter a valid South African phone number (e.g. 0821234567)'
    ),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Step 3 — Payment
export const step3Schema = z.object({
  paymentOption: z.enum(['deposit', 'full'], {
    message: 'Please select a payment option',
  }),
});

// Full form schema combining all steps
export const bookingSchema = step1Schema.merge(step2Schema).merge(step3Schema);
export type BookingFormData = z.infer<typeof bookingSchema>;