<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'bookings')]
class Booking
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 32)]
    private string $id;

    #[ORM\Column(name: 'event_type_id', type: 'string', length: 32)]
    private string $eventTypeId;

    #[ORM\Column(name: 'guest_name', type: 'string', length: 100)]
    private string $guestName;

    #[ORM\Column(name: 'guest_email', type: 'string', length: 180)]
    private string $guestEmail;

    #[ORM\Column(name: 'start_time', type: 'datetime_immutable')]
    private \DateTimeImmutable $startTime;

    #[ORM\Column(name: 'end_time', type: 'datetime_immutable')]
    private \DateTimeImmutable $endTime;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct(
        string $id,
        string $eventTypeId,
        string $guestName,
        string $guestEmail,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime,
        ?\DateTimeImmutable $createdAt = null,
    ) {
        $this->id = $id;
        $this->eventTypeId = $eventTypeId;
        $this->guestName = $guestName;
        $this->guestEmail = $guestEmail;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
        $this->createdAt = $createdAt ?? new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getEventTypeId(): string
    {
        return $this->eventTypeId;
    }

    public function getGuestName(): string
    {
        return $this->guestName;
    }

    public function getGuestEmail(): string
    {
        return $this->guestEmail;
    }

    public function getStartTime(): \DateTimeImmutable
    {
        return $this->startTime;
    }

    public function getEndTime(): \DateTimeImmutable
    {
        return $this->endTime;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
