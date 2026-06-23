<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

abstract class AbstractApiController extends AbstractController
{
    public function __construct(protected readonly ValidatorInterface $validator)
    {
    }

    /**
     * @return array<string, mixed>
     */
    protected function decodeBody(Request $request): array
    {
        $content = $request->getContent();
        if ($content === '') {
            return [];
        }

        try {
            $data = json_decode($content, true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new BadRequestHttpException('Request body must be valid JSON');
        }

        if (!is_array($data)) {
            throw new BadRequestHttpException('Request body must be a JSON object');
        }

        return $data;
    }

    /**
     * Validates a DTO and returns a 400 response when invalid, otherwise null.
     */
    protected function validateDto(object $dto): ?JsonResponse
    {
        $violations = $this->validator->validate($dto);
        if (count($violations) === 0) {
            return null;
        }

        $errors = [];
        foreach ($violations as $violation) {
            $errors[] = [
                'field' => $violation->getPropertyPath(),
                'message' => $violation->getMessage(),
            ];
        }

        return new JsonResponse([
            'code' => 'VALIDATION_ERROR',
            'message' => 'Validation failed',
            'errors' => $errors,
        ], JsonResponse::HTTP_BAD_REQUEST);
    }
}
