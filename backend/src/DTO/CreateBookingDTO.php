<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateBookingDTO
{
    #[Assert\NotBlank]
    public ?string $eventTypeId = null;

    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    public ?string $guestName = null;

    #[Assert\NotBlank]
    #[Assert\Email]
    public ?string $guestEmail = null;

    /** ISO 8601 UTC, e.g. 2026-06-25T10:00:00Z */
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/',
        message: 'startTime must be ISO 8601 UTC, e.g. 2026-06-25T10:00:00Z.'
    )]
    public ?string $startTime = null;

    public static function fromArray(array $data): self
    {
        $dto = new self();
        $dto->eventTypeId = isset($data['eventTypeId']) ? (string) $data['eventTypeId'] : null;
        $dto->guestName = isset($data['guestName']) ? (string) $data['guestName'] : null;
        $dto->guestEmail = isset($data['guestEmail']) ? (string) $data['guestEmail'] : null;
        $dto->startTime = isset($data['startTime']) ? (string) $data['startTime'] : null;

        return $dto;
    }
}
