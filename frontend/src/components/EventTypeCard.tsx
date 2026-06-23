import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/datetime';
import type { EventType } from '@/types/api';

export function EventTypeCard({ eventType }: { eventType: EventType }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{eventType.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(eventType.duration)}
          </Badge>
        </div>
        {eventType.description ? (
          <CardDescription className="line-clamp-3">
            {eventType.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/booking/${eventType.id}`}>
            Записаться
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
