<?php

namespace App\EventSubscriber;

use App\Exception\ConflictException;
use App\Exception\NotFoundException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Converts exceptions on /api routes into a uniform JSON error: {code, message}.
 */
class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly bool $debug = false)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => ['onKernelException', 0],
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $throwable = $event->getThrowable();

        [$status, $code] = match (true) {
            $throwable instanceof NotFoundException => [404, 'NOT_FOUND'],
            $throwable instanceof ConflictException => [409, 'CONFLICT'],
            $throwable instanceof HttpExceptionInterface => [
                $throwable->getStatusCode(),
                $this->codeForStatus($throwable->getStatusCode()),
            ],
            default => [500, 'INTERNAL_ERROR'],
        };

        $message = ($status >= 500 && !$this->debug)
            ? 'Internal server error'
            : $throwable->getMessage();

        $event->setResponse(new JsonResponse(
            ['code' => $code, 'message' => $message],
            $status,
        ));
    }

    private function codeForStatus(int $status): string
    {
        return match ($status) {
            400 => 'BAD_REQUEST',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            409 => 'CONFLICT',
            default => 'ERROR',
        };
    }
}
