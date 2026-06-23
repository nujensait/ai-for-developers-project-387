import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorState } from '@/components/ErrorState';
import { EventTypeFormDialog } from '@/components/EventTypeFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  useBookings,
  useDeleteBooking,
  useDeleteEventType,
  useEventTypes,
} from '@/hooks/api';
import { ApiError } from '@/lib/api';
import { formatDuration, formatUtcDateTime } from '@/lib/datetime';
import type { Booking, EventType } from '@/types/api';

export default function AdminPage() {
  const eventTypesQuery = useEventTypes();
  const bookingsQuery = useBookings();
  const deleteEventType = useDeleteEventType();
  const deleteBooking = useDeleteBooking();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | undefined>();
  const [deletingEventType, setDeletingEventType] = useState<EventType>();
  const [cancelingBooking, setCancelingBooking] = useState<Booking>();

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    eventTypesQuery.data?.forEach((et) => map.set(et.id, et.title));
    return map;
  }, [eventTypesQuery.data]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (eventType: EventType) => {
    setEditing(eventType);
    setFormOpen(true);
  };

  const handleError = (error: unknown) =>
    toast.error(
      error instanceof ApiError ? error.message : 'Операция не выполнена',
    );

  const confirmDeleteEventType = () => {
    if (!deletingEventType) return;
    deleteEventType.mutate(deletingEventType.id, {
      onSuccess: () => {
        toast.success('Тип события удалён');
        setDeletingEventType(undefined);
      },
      onError: handleError,
    });
  };

  const confirmCancelBooking = () => {
    if (!cancelingBooking) return;
    deleteBooking.mutate(cancelingBooking.id, {
      onSuccess: () => {
        toast.success('Бронирование отменено');
        setCancelingBooking(undefined);
      },
      onError: handleError,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Админка</h1>
        <p className="text-muted-foreground">
          Управление типами событий и просмотр бронирований.
        </p>
      </div>

      {/* Event types */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Типы событий</CardTitle>
            <CardDescription>Создание, редактирование, удаление.</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Создать
          </Button>
        </CardHeader>
        <CardContent>
          {eventTypesQuery.isLoading ? (
            <TableSkeleton columns={3} />
          ) : eventTypesQuery.isError ? (
            <ErrorState
              message={eventTypesQuery.error?.message}
              onRetry={() => eventTypesQuery.refetch()}
            />
          ) : !eventTypesQuery.data || eventTypesQuery.data.length === 0 ? (
            <EmptyRow text="Типы событий ещё не созданы." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="w-[1%] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypesQuery.data.map((et) => (
                  <TableRow key={et.id}>
                    <TableCell className="font-medium">{et.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {et.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatDuration(et.duration)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(et)}
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingEventType(et)}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Бронирования
          </CardTitle>
          <CardDescription>Все записи гостей.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsQuery.isLoading ? (
            <TableSkeleton columns={5} />
          ) : bookingsQuery.isError ? (
            <ErrorState
              message={bookingsQuery.error?.message}
              onRetry={() => bookingsQuery.refetch()}
            />
          ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
            <EmptyRow text="Бронирований пока нет." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Гость</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead>Начало (UTC)</TableHead>
                  <TableHead>Окончание (UTC)</TableHead>
                  <TableHead className="w-[1%] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsQuery.data.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.guestName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.guestEmail}
                    </TableCell>
                    <TableCell>
                      {titleById.get(booking.eventTypeId) ?? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {booking.eventTypeId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatUtcDateTime(booking.startTime)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatUtcDateTime(booking.endTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCancelingBooking(booking)}
                        aria-label="Отменить"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EventTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        eventType={editing}
      />

      <ConfirmDialog
        open={Boolean(deletingEventType)}
        onOpenChange={(open) => !open && setDeletingEventType(undefined)}
        title="Удалить тип события?"
        description={
          deletingEventType
            ? `«${deletingEventType.title}» будет удалён безвозвратно.`
            : undefined
        }
        pending={deleteEventType.isPending}
        onConfirm={confirmDeleteEventType}
      />

      <ConfirmDialog
        open={Boolean(cancelingBooking)}
        onOpenChange={(open) => !open && setCancelingBooking(undefined)}
        title="Отменить бронирование?"
        description={
          cancelingBooking
            ? `Запись гостя ${cancelingBooking.guestName} будет удалена.`
            : undefined
        }
        confirmLabel="Отменить запись"
        pending={deleteBooking.isPending}
        onConfirm={confirmCancelBooking}
      />
    </div>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
