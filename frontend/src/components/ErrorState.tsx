import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="max-w-md text-sm text-muted-foreground">
        {message ?? 'Не удалось загрузить данные.'}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      ) : null}
    </div>
  );
}
