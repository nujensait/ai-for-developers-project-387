import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/Spinner';
import { cn } from '@/lib/utils';
import { useCreateEventType, useUpdateEventType } from '@/hooks/api';
import { ApiError } from '@/lib/api';
import { formatDuration } from '@/lib/datetime';
import { DURATIONS, type EventType } from '@/types/api';

interface EventTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType?: EventType;
}

export function EventTypeFormDialog({
  open,
  onOpenChange,
  eventType,
}: EventTypeFormDialogProps) {
  const isEdit = Boolean(eventType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [titleError, setTitleError] = useState<string>();

  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const pending = createMutation.isPending || updateMutation.isPending;

  // Sync form state whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setTitle(eventType?.title ?? '');
      setDescription(eventType?.description ?? '');
      setDuration(eventType?.duration ?? 30);
      setTitleError(undefined);
    }
  }, [open, eventType]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError('Укажите название');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      duration,
    };

    const onError = (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Не удалось сохранить',
      );
    };

    if (isEdit && eventType) {
      updateMutation.mutate(
        { id: eventType.id, payload },
        {
          onSuccess: () => {
            toast.success('Тип события обновлён');
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Тип события создан');
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать тип события' : 'Новый тип события'}
          </DialogTitle>
          <DialogDescription>
            Название, описание и длительность встречи.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Интро-звонок"
              maxLength={100}
              aria-invalid={Boolean(titleError)}
              autoFocus
            />
            {titleError ? (
              <p className="text-sm text-destructive">{titleError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткое описание (необязательно)"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>Длительность</Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDuration(value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    duration === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:bg-accent',
                  )}
                >
                  {formatDuration(value)}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner className="h-4 w-4" /> : null}
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
