<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateEventTypeDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    public ?string $title = null;

    #[Assert\Length(max: 500)]
    public ?string $description = null;

    #[Assert\NotNull]
    #[Assert\Choice(choices: [15, 30, 45, 60, 90, 120], message: 'Duration must be one of: 15, 30, 45, 60, 90, 120.')]
    public ?int $duration = null;

    public static function fromArray(array $data): self
    {
        $dto = new self();
        $dto->title = isset($data['title']) ? (string) $data['title'] : null;
        $dto->description = isset($data['description']) && $data['description'] !== null
            ? (string) $data['description']
            : null;
        $dto->duration = isset($data['duration']) && is_numeric($data['duration'])
            ? (int) $data['duration']
            : ($data['duration'] ?? null);

        return $dto;
    }
}
