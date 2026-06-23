/**
 * API types — mirror the backend contract (TypeSpec / OpenAPI).
 */

export type Duration = 15 | 30 | 45 | 60 | 90 | 120;

export interface EventType {
  id: string;
  title: string;
  description: string | null;
  duration: number;
}

export interface CreateEventType {
  title: string;
  description?: string | null;
  duration: number;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  /** ISO 8601 UTC */
  startTime: string;
  /** ISO 8601 UTC */
  endTime: string;
  /** ISO 8601 UTC */
  createdAt: string;
}

export interface CreateBooking {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  /** ISO 8601 UTC, e.g. 2026-06-25T10:00:00Z */
  startTime: string;
}

export interface TimeSlot {
  /** ISO 8601 UTC */
  start: string;
  /** ISO 8601 UTC */
  end: string;
  isAvailable: boolean;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export const DURATIONS: Duration[] = [15, 30, 45, 60, 90, 120];
