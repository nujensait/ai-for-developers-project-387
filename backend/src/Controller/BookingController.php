<?php

namespace App\Controller;

use App\DTO\BookingDTO;
use App\DTO\CreateBookingDTO;
use App\Service\AvailabilityService;
use App\Service\BookingService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class BookingController extends AbstractApiController
{
    public function __construct(
        private readonly BookingService $bookingService,
        private readonly AvailabilityService $availabilityService,
        ValidatorInterface $validator,
    ) {
        parent::__construct($validator);
    }

    #[Route('/api/availability', name: 'availability_list', methods: ['GET'])]
    public function availability(Request $request): JsonResponse
    {
        $eventTypeId = $request->query->get('eventTypeId');
        $from = $request->query->get('from');
        $to = $request->query->get('to');

        if (!$eventTypeId || !$from || !$to) {
            return new JsonResponse([
                'code' => 'VALIDATION_ERROR',
                'message' => 'Query parameters "eventTypeId", "from" and "to" are required',
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $fromDate = new \DateTimeImmutable((string) $from, new \DateTimeZone('UTC'));
            $toDate = new \DateTimeImmutable((string) $to, new \DateTimeZone('UTC'));
        } catch (\Exception) {
            return new JsonResponse([
                'code' => 'VALIDATION_ERROR',
                'message' => 'Parameters "from" and "to" must be valid dates',
            ], Response::HTTP_BAD_REQUEST);
        }

        $slots = array_map(
            static fn ($slot) => $slot->toArray(),
            $this->availabilityService->getSlots((string) $eventTypeId, $fromDate, $toDate),
        );

        return new JsonResponse($slots, Response::HTTP_OK);
    }

    #[Route('/api/bookings', name: 'bookings_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $data = array_map(
            static fn ($booking) => BookingDTO::fromEntity($booking)->toArray(),
            $this->bookingService->getAll(),
        );

        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/api/bookings/{id}', name: 'bookings_read', methods: ['GET'])]
    public function read(string $id): JsonResponse
    {
        $booking = $this->bookingService->getByIdOrFail($id);

        return new JsonResponse(BookingDTO::fromEntity($booking)->toArray(), Response::HTTP_OK);
    }

    #[Route('/api/bookings', name: 'bookings_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = CreateBookingDTO::fromArray($this->decodeBody($request));
        if ($response = $this->validateDto($dto)) {
            return $response;
        }

        $booking = $this->bookingService->create($dto);

        return new JsonResponse(BookingDTO::fromEntity($booking)->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/api/bookings/{id}', name: 'bookings_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->bookingService->delete($id);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
