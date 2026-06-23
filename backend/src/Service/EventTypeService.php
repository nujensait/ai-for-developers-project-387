<?php

namespace App\Service;

use App\DTO\CreateEventTypeDTO;
use App\Entity\EventType;
use App\Exception\NotFoundException;
use App\Repository\EventTypeRepository;

class EventTypeService
{
    public function __construct(private readonly EventTypeRepository $repository)
    {
    }

    /**
     * @return EventType[]
     */
    public function getAll(): array
    {
        return $this->repository->findAllOrdered();
    }

    public function getById(string $id): ?EventType
    {
        return $this->repository->find($id);
    }

    public function getByIdOrFail(string $id): EventType
    {
        $eventType = $this->repository->find($id);
        if ($eventType === null) {
            throw new NotFoundException(sprintf('Event type "%s" not found', $id));
        }

        return $eventType;
    }

    public function create(CreateEventTypeDTO $dto): EventType
    {
        $eventType = new EventType(
            $this->generateId(),
            (string) $dto->title,
            (int) $dto->duration,
            $dto->description,
        );
        $this->repository->save($eventType);

        return $eventType;
    }

    public function update(string $id, CreateEventTypeDTO $dto): EventType
    {
        $eventType = $this->getByIdOrFail($id);
        $eventType
            ->setTitle((string) $dto->title)
            ->setDuration((int) $dto->duration)
            ->setDescription($dto->description);
        $this->repository->save($eventType);

        return $eventType;
    }

    public function delete(string $id): void
    {
        $eventType = $this->getByIdOrFail($id);
        $this->repository->remove($eventType);
    }

    private function generateId(): string
    {
        return 'evt_'.bin2hex(random_bytes(8));
    }
}
