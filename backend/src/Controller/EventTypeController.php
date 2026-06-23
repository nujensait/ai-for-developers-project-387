<?php

namespace App\Controller;

use App\DTO\CreateEventTypeDTO;
use App\DTO\EventTypeDTO;
use App\Service\EventTypeService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/event-types')]
class EventTypeController extends AbstractApiController
{
    public function __construct(
        private readonly EventTypeService $service,
        ValidatorInterface $validator,
    ) {
        parent::__construct($validator);
    }

    #[Route('', name: 'event_types_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $data = array_map(
            static fn ($eventType) => EventTypeDTO::fromEntity($eventType)->toArray(),
            $this->service->getAll(),
        );

        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'event_types_read', methods: ['GET'])]
    public function read(string $id): JsonResponse
    {
        $eventType = $this->service->getByIdOrFail($id);

        return new JsonResponse(EventTypeDTO::fromEntity($eventType)->toArray(), Response::HTTP_OK);
    }

    #[Route('', name: 'event_types_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = CreateEventTypeDTO::fromArray($this->decodeBody($request));
        if ($response = $this->validateDto($dto)) {
            return $response;
        }

        $eventType = $this->service->create($dto);

        return new JsonResponse(EventTypeDTO::fromEntity($eventType)->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'event_types_update', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $dto = CreateEventTypeDTO::fromArray($this->decodeBody($request));
        if ($response = $this->validateDto($dto)) {
            return $response;
        }

        $eventType = $this->service->update($id, $dto);

        return new JsonResponse(EventTypeDTO::fromEntity($eventType)->toArray(), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'event_types_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->service->delete($id);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
