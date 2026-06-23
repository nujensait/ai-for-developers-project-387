<?php

namespace App\DTO;

use App\Entity\Booking;

class BookingDTO
{
    public string $id;
    public string $eventTypeId;
    public string $guestName;
    public string $guestEmail;
    public string $startTime;
    public string $endTime;
    public string $createdAt;

    private const FORMAT = 'Y-m-d\TH:i:s\Z';

    public static function fromEntity(Booking $booking): self
    {
        $dto = new self();
        $dto->id = $booking->getId();
        $dto->eventTypeId = $booking->getEventTypeId();
        $dto->guestName = $booking->getGuestName();
        $dto->guestEmail = $booking->getGuestEmail();
        $dto->startTime = $booking->getStartTime()->format(self::FORMAT);
        $dto->endTime = $booking->getEndTime()->format(self::FORMAT);
        $dto->createdAt = $booking->getCreatedAt()->format(self::FORMAT);

        return $dto;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'eventTypeId' => $this->eventTypeId,
            'guestName' => $this->guestName,
            'guestEmail' => $this->guestEmail,
            'startTime' => $this->startTime,
            'endTime' => $this->endTime,
            'createdAt' => $this->createdAt,
        ];
    }
}
