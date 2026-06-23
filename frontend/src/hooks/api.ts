import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '@/lib/api';
import { toUtcDayRange } from '@/lib/datetime';
import type { CreateBooking, CreateEventType } from '@/types/api';

const KEYS = {
  eventTypes: ['event-types'] as const,
  bookings: ['bookings'] as const,
  availability: ['availability'] as const,
};

// --- Event types ---

export function useEventTypes() {
  return useQuery({
    queryKey: KEYS.eventTypes,
    queryFn: api.listEventTypes,
  });
}

export function useEventType(id?: string) {
  return useQuery({
    queryKey: ['event-types', id],
    queryFn: () => api.getEventType(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventType) => api.createEventType(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.eventTypes }),
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEventType }) =>
      api.updateEventType(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.eventTypes }),
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteEventType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.eventTypes }),
  });
}

// --- Availability ---

export function useAvailability(eventTypeId?: string, day?: Date) {
  const range = day ? toUtcDayRange(day) : null;
  return useQuery({
    queryKey: ['availability', eventTypeId, range?.from],
    queryFn: () =>
      api.getAvailability(eventTypeId as string, range!.from, range!.to),
    enabled: Boolean(eventTypeId) && Boolean(range),
  });
}

// --- Bookings ---

export function useBookings() {
  return useQuery({
    queryKey: KEYS.bookings,
    queryFn: api.listBookings,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBooking) => api.createBooking(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.bookings });
      qc.invalidateQueries({ queryKey: KEYS.availability });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.bookings });
      qc.invalidateQueries({ queryKey: KEYS.availability });
    },
  });
}
