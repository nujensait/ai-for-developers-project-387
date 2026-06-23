import type {
  ApiErrorBody,
  Booking,
  CreateBooking,
  CreateEventType,
  EventType,
  TimeSlot,
} from '@/types/api';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081').replace(
  /\/$/,
  '',
);

/** Error thrown for any non-2xx API response. Carries the backend error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body?: ApiErrorBody;

  constructor(status: number, body?: ApiErrorBody) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code ?? 'ERROR';
    this.body = body;
  }

  isConflict(): boolean {
    return this.status === 409;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (cause) {
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message:
        'Не удалось связаться с сервером. Убедитесь, что бэкенд запущен на ' +
        API_URL,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody);
  }

  return data as T;
}

export const api = {
  // --- Event types ---
  listEventTypes: () => request<EventType[]>('/api/event-types'),
  getEventType: (id: string) => request<EventType>(`/api/event-types/${id}`),
  createEventType: (payload: CreateEventType) =>
    request<EventType>('/api/event-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateEventType: (id: string, payload: CreateEventType) =>
    request<EventType>(`/api/event-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteEventType: (id: string) =>
    request<void>(`/api/event-types/${id}`, { method: 'DELETE' }),

  // --- Availability ---
  getAvailability: (eventTypeId: string, from: string, to: string) =>
    request<TimeSlot[]>(
      `/api/availability?eventTypeId=${encodeURIComponent(
        eventTypeId,
      )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  // --- Bookings ---
  listBookings: () => request<Booking[]>('/api/bookings'),
  getBooking: (id: string) => request<Booking>(`/api/bookings/${id}`),
  createBooking: (payload: CreateBooking) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteBooking: (id: string) =>
    request<void>(`/api/bookings/${id}`, { method: 'DELETE' }),
};

export { API_URL };
