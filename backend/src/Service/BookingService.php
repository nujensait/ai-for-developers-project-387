<?php

namespace App\Service;

use App\DTO\CreateBookingDTO;
use App\Entity\Booking;
use App\Exception\ConflictException;
use App\Exception\NotFoundException;
use App\Repository\BookingRepository;
use App\Repository\EventTypeRepository;

class BookingService
{
    public function __construct(
        private readonly BookingRepository $bookingRepository,
        private readonly EventTypeRepository $eventTypeRepository,
    ) {
    }

    /**
     * @return Booking[]
     */
    public function getAll(): array
    {
        return $this->bookingRepository->findAllOrdered();
    }

    public function getByIdOrFail(string $id): Booking
    {
        $booking = $this->bookingRepository->find($id);
        if ($booking === null) {
            throw new NotFoundException(sprintf('Booking "%s" not found', $id));
        }

        return $booking;
    }

    public function create(CreateBookingDTO $dto): Booking
    {
        $eventType = $this->eventTypeRepository->find((string) $dto->eventTypeId);
        if ($eventType === null) {
            throw new NotFoundException(sprintf('Event type "%s" not found', $dto->eventTypeId));
        }

        $start = new \DateTimeImmutable((string) $dto->startTime, new \DateTimeZone('UTC'));
        $start = $start->setTimezone(new \DateTimeZone('UTC'));
        $end = $start->modify(sprintf('+%d minutes', $eventType->getDuration()));

        if ($this->bookingRepository->findConflicting($start, $end) !== null) {
            throw new ConflictException('The requested time slot is already booked');
        }

        $booking = new Booking(
            $this->generateId(),
            $eventType->getId(),
            (string) $dto->guestName,
            (string) $dto->guestEmail,
            $start,
            $end,
        );
        $this->bookingRepository->save($booking);

        return $booking;
    }

    public function delete(string $id): void
    {
        $booking = $this->getByIdOrFail($id);
        $this->bookingRepository->remove($booking);
    }

    private function generateId(): string
    {
        return 'bok_'.bin2hex(random_bytes(8));
    }
}
