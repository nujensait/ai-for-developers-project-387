<?php

namespace App\DTO;

class SlotDTO
{
    private const FORMAT = 'Y-m-d\TH:i:s\Z';

    public function __construct(
        public \DateTimeImmutable $start,
        public \DateTimeImmutable $end,
        public bool $isAvailable,
    ) {
    }

    public function toArray(): array
    {
        return [
            'start' => $this->start->format(self::FORMAT),
            'end' => $this->end->format(self::FORMAT),
            'isAvailable' => $this->isAvailable,
        ];
    }
}
