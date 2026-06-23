import { useEventTypes } from '@/hooks/api';
import { EventTypeCard } from '@/components/EventTypeCard';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader } from '@/components/ui/card';

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useEventTypes();

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Выберите тип встречи
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Запишитесь на удобное время. Доступные слоты — по 30 минут,
          с 09:00 до 21:00 (UTC), на 14 дней вперёд.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          Пока нет доступных типов событий.
          <br />
          Создайте их в{' '}
          <a href="/admin" className="font-medium text-primary underline">
            админке
          </a>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} />
          ))}
        </div>
      )}
    </div>
  );
}
