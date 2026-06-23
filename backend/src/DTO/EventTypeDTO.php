<?php

namespace App\DTO;

use App\Entity\EventType;

class EventTypeDTO
{
    public string $id;
    public string $title;
    public ?string $description = null;
    public int $duration;

    public static function fromEntity(EventType $eventType): self
    {
        $dto = new self();
        $dto->id = $eventType->getId();
        $dto->title = $eventType->getTitle();
        $dto->description = $eventType->getDescription();
        $dto->duration = $eventType->getDuration();

        return $dto;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'duration' => $this->duration,
        ];
    }
}
