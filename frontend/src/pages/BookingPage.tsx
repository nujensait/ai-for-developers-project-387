import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDays, startOfToday } from 'date-fns';
import { ArrowLeft, CalendarCheck, CheckCircle2, Clock } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SlotPicker } from '@/components/SlotPicker';
import { BookingForm } from '@/components/BookingForm';
import { ErrorState } from '@/components/ErrorState';
import { FullPageSpinner } from '@/components/Spinner';
import { useAvailability, useEventType } from '@/hooks/api';
import {
  formatDuration,
  formatHumanDate,
  formatSlotTime,
  formatUtcDateTime,
} from '@/lib/datetime';
import type { Booking, TimeSlot } from '@/types/api';

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();

  const today = startOfToday();
  const maxDate = addDays(today, 13);

  const [day, setDay] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [confirmed, setConfirmed] = useState<Booking | undefined>();

  const eventTypeQuery = useEventType(eventTypeId);
  const availabilityQuery = useAvailability(eventTypeId, day);

  // Clear a selected slot whenever the chosen day changes.
  useEffect(() => {
    setSelectedSlot(undefined);
  }, [day]);

  if (eventTypeQuery.isLoading) {
    return <FullPageSpinner label="Загружаем тип события…" />;
  }

  if (eventTypeQuery.isError || !eventTypeQuery.data) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          message="Тип события не найден."
          onRetry={() => eventTypeQuery.refetch()}
        />
      </div>
    );
  }

  const eventType = eventTypeQuery.data;
  const dialogOpen = Boolean(selectedSlot);

  const closeDialog = () => {
    setSelectedSlot(undefined);
    setConfirmed(undefined);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-2xl">{eventType.title}</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(eventType.duration)}
            </Badge>
          </div>
          {eventType.description ? (
            <CardDescription>{eventType.description}</CardDescription>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="justify-self-center md:justify-self-start">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">1. Выберите дату</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={day}
              onSelect={setDay}
              fromDate={today}
              toDate={maxDate}
              disabled={{ before: today, after: maxDate }}
              initialFocus
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              2. Выберите время{' '}
              {day ? (
                <span className="font-normal text-muted-foreground">
                  · {formatHumanDate(day)}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!day ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Сначала выберите дату в календаре.
              </p>
            ) : (
              <SlotPicker
                slots={availabilityQuery.data}
                isLoading={availabilityQuery.isLoading}
                isError={availabilityQuery.isError}
                onRetry={() => availabilityQuery.refetch()}
                onSelect={setSelectedSlot}
                selectedStart={selectedSlot?.start}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          {confirmed ? (
            <ConfirmationView booking={confirmed} onClose={closeDialog} />
          ) : selectedSlot ? (
            <>
              <DialogHeader>
                <DialogTitle>Бронирование</DialogTitle>
                <DialogDescription>
                  Заполните данные гостя, чтобы подтвердить запись.
                </DialogDescription>
              </DialogHeader>
              <BookingForm
                eventType={eventType}
                slot={selectedSlot}
                onSuccess={setConfirmed}
                onConflict={() => {
                  setSelectedSlot(undefined);
                  availabilityQuery.refetch();
                }}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
      <Link to="/">
        <ArrowLeft className="h-4 w-4" />
        Ко всем событиям
      </Link>
    </Button>
  );
}

function ConfirmationView({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <DialogTitle className="text-xl">Запись подтверждена!</DialogTitle>
        <DialogDescription>
          Мы отправили детали на {booking.guestEmail}
        </DialogDescription>
      </div>

      <div className="space-y-2 rounded-md border bg-muted/40 p-4 text-left text-sm">
        <Row icon={<CalendarCheck className="h-4 w-4" />} label="Начало">
          {formatUtcDateTime(booking.startTime)} UTC
        </Row>
        <Row icon={<Clock className="h-4 w-4" />} label="Окончание">
          {formatSlotTime(booking.endTime)} UTC
        </Row>
        <Row label="Гость">{booking.guestName}</Row>
        <Row label="Код брони">
          <span className="font-mono text-xs">{booking.id}</span>
        </Row>
      </div>

      <Button onClick={onClose} className="w-full">
        Готово
      </Button>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
