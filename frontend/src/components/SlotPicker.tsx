import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ErrorState';
import { formatSlotTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/api';

interface SlotPickerProps {
  slots?: TimeSlot[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (slot: TimeSlot) => void;
  selectedStart?: string;
}

export function SlotPicker({
  slots,
  isLoading,
  isError,
  onRetry,
  onSelect,
  selectedStart,
}: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState message="Не удалось загрузить слоты." onRetry={onRetry} />
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        На выбранную дату нет слотов.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const selected = slot.start === selectedStart;
        return (
          <Button
            key={slot.start}
            type="button"
            variant={selected ? 'default' : 'outline'}
            disabled={!slot.isAvailable}
            onClick={() => onSelect(slot)}
            className={cn(
              'tabular-nums',
              !slot.isAvailable && 'line-through opacity-40',
            )}
          >
            {formatSlotTime(slot.start)}
          </Button>
        );
      })}
    </div>
  );
}
