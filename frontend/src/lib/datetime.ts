import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Slots and bookings use UTC working hours (09:00–21:00). To keep the grid
 * stable regardless of the browser timezone, we read the time/date parts
 * directly from the ISO string instead of converting to local time.
 */

/** "2026-06-25T10:00:00Z" -> "10:00" */
export function formatSlotTime(iso: string): string {
  return iso.slice(11, 16);
}

/** "2026-06-25T10:00:00Z" -> "25.06.2026 10:00" */
export function formatUtcDateTime(iso: string): string {
  const date = `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
  const time = iso.slice(11, 16);
  return `${date} ${time}`;
}

/** Build the UTC day range [00:00:00Z, 23:59:59Z] for a picked calendar day. */
export function toUtcDayRange(day: Date): { from: string; to: string } {
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, '0');
  const d = String(day.getDate()).padStart(2, '0');
  return {
    from: `${y}-${m}-${d}T00:00:00Z`,
    to: `${y}-${m}-${d}T23:59:59Z`,
  };
}

/** Human-readable date, e.g. "25 июня 2026". */
export function formatHumanDate(day: Date): string {
  return format(day, 'd MMMM yyyy', { locale: ru });
}

/** Duration in minutes -> "30 мин" / "1 ч" / "1 ч 30 мин". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
}
