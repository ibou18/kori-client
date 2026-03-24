export type WebBookingStep = "auth" | "slot" | "pay";

export interface WebBookingServiceOption {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
}

export interface WebBookingServicePayload {
  id: string;
  name: string;
  duration?: number;
  photos?: Array<{ url: string; alt?: string }>;
  options?: WebBookingServiceOption[];
}

export interface SalonBookingTimeSlot {
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  available: boolean;
}

export interface SalonBookingDay {
  date: string;
  isOpen: boolean;
  timeSlots: SalonBookingTimeSlot[];
  hasHoliday?: boolean;
  holidayReason?: string;
}

export interface SalonBookingAvailabilityPayload {
  salonId: string;
  date: string;
  timezone: string;
  day: SalonBookingDay;
}
