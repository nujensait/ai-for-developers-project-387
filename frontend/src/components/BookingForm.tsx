import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';
import { useCreateBooking } from '@/hooks/api';
import { ApiError } from '@/lib/api';
import { formatSlotTime } from '@/lib/datetime';
import { validateGuest, type GuestFormErrors } from '@/lib/validation';
import type { Booking, EventType, TimeSlot } from '@/types/api';

interface BookingFormProps {
  eventType: EventType;
  slot: TimeSlot;
  onSuccess: (booking: Booking) => void;
  onConflict: () => void;
}

export function BookingForm({
  eventType,
  slot,
  onSuccess,
  onConflict,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [errors, setErrors] = useState<GuestFormErrors>({});

  const mutation = useCreateBooking();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateGuest({ guestName, guestEmail });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    mutation.mutate(
      {
        eventTypeId: eventType.id,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        startTime: slot.start,
      },
      {
        onSuccess: (booking) => {
          toast.success('Бронирование создано');
          onSuccess(booking);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.isConflict()) {
            toast.error('Этот слот только что заняли. Выберите другой.');
            onConflict();
            return;
          }
          toast.error(
            error instanceof ApiError
              ? error.message
              : 'Не удалось создать бронирование',
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md bg-muted p-3 text-sm">
        <span className="font-medium">{eventType.title}</span>
        <span className="text-muted-foreground"> · слот {formatSlotTime(slot.start)}–{formatSlotTime(slot.end)} UTC</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestName">Ваше имя</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Иван Петров"
          aria-invalid={Boolean(errors.guestName)}
          autoFocus
        />
        {errors.guestName ? (
          <p className="text-sm text-destructive">{errors.guestName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestEmail">Email</Label>
        <Input
          id="guestEmail"
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="ivan@example.com"
          aria-invalid={Boolean(errors.guestEmail)}
        />
        {errors.guestEmail ? (
          <p className="text-sm text-destructive">{errors.guestEmail}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
        Подтвердить бронирование
      </Button>
    </form>
  );
}
