## Спецификация для разработки проекта (для ИИ-агента)

### Общая информация
- **Проект:** Сервис бронирования времени "Календарь"
- **Стек:** Symfony 7.2, PHP 8.3, Docker, встроенный веб-сервер PHP (для разработки)
- **Подход:** Design First (API-контракт из TypeSpec)
- **Хранилище:** In-memory (через `symfony/cache` ArrayAdapter)
- **Фронтенд:** Отдельное приложение (React/Vite)
- **Деплой:** Docker-образ (единый для фронтенда и бэкенда)

---

### Структура проекта

```
calendar/
├── .github/workflows/          # CI/CD (тесты, релизы)
├── backend/                    # Symfony-приложение
│   ├── config/
│   │   ├── packages/           # Конфигурация бандлов
│   │   ├── routes/             # Маршруты
│   │   └── services.yaml       # Сервисы
│   ├── public/
│   │   └── index.php           # Входная точка
│   ├── src/
│   │   ├── Controller/
│   │   │   ├── EventTypeController.php
│   │   │   └── BookingController.php
│   │   ├── DTO/
│   │   │   ├── EventTypeDTO.php
│   │   │   ├── CreateEventTypeDTO.php
│   │   │   ├── BookingDTO.php
│   │   │   ├── CreateBookingDTO.php
│   │   │   └── SlotDTO.php
│   │   ├── Entity/
│   │   │   ├── EventType.php
│   │   │   └── Booking.php
│   │   ├── Repository/
│   │   │   ├── InMemoryEventTypeRepository.php
│   │   │   └── InMemoryBookingRepository.php
│   │   ├── Service/
│   │   │   ├── EventTypeService.php
│   │   │   ├── BookingService.php
│   │   │   └── AvailabilityService.php
│   │   └── Exception/
│   │       ├── ConflictException.php
│   │       └── NotFoundException.php
│   ├── tests/                  # Интеграционные тесты
│   ├── Dockerfile              # Сборка бэкенда
│   ├── composer.json
│   └── phpunit.xml.dist
├── frontend/                   # React-приложение
├── typespec/                   # TypeSpec-спецификация
├── docker-compose.yml          # Локальный запуск
├── Makefile                    # Упрощённые команды
└── README.md
```

---

### Требования к окружению разработки (WSL)

1. **PHP 8.3** с расширениями: `intl`, `opcache`, `mbstring`, `xml`, `json`
2. **Composer** 2.x
3. **Docker** и **Docker Compose** (установлены в Windows/WSL)
4. **Node.js 22** (для фронтенда и TypeSpec)
5. **Make** (для упрощения команд)

---

### Конфигурация Symfony

#### `config/services.yaml`
```yaml
parameters:
    app.working_hours_start: 9
    app.working_hours_end: 21
    app.availability_days: 14

services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\:
        resource: '../src/'
        exclude:
            - '../src/DTO/'
            - '../src/Entity/'
            - '../src/Kernel.php'

    # In-memory репозитории (синглтоны)
    App\Repository\InMemoryEventTypeRepository:
        arguments:
            $cacheAdapter: '@cache.adapter.array'
        public: true

    App\Repository\InMemoryBookingRepository:
        arguments:
            $cacheAdapter: '@cache.adapter.array'
        public: true
```

#### `config/packages/cache.yaml`
```yaml
framework:
    cache:
        pools:
            cache.event_types:
                adapter: cache.adapter.array
            cache.bookings:
                adapter: cache.adapter.array
```

#### `config/packages/nelmio_api_doc.yaml`
```yaml
nelmio_api_doc:
    documentation:
        info:
            title: Calendar API
            version: 1.0.0
    areas:
        path_patterns:
            - ^/api
    routes:
        path_patterns:
            - ^/api
```

#### `config/packages/fos_rest.yaml`
```yaml
fos_rest:
    view:
        view_response_listener: true
        formats:
            json: true
        templating_formats:
            json: false
    format_listener:
        rules:
            - { path: '^/api', priorities: ['json'], fallback_format: json }
```

#### `config/routes/nelmio_api_doc.yaml`
```yaml
app.swagger_ui:
    path: /api/doc
    controller: nelmio_api_doc.controller.swagger_ui
```

---

### Доменные сущности (Entity)

#### `src/Entity/EventType.php`
```php
<?php

namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class EventType
{
    private string $id;
    
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private string $title;
    
    #[Assert\Length(max: 500)]
    private ?string $description = null;
    
    #[Assert\NotBlank]
    #[Assert\Choice([15, 30, 45, 60, 90, 120])]
    private int $duration; // минуты
    
    public function __construct(string $id, string $title, int $duration, ?string $description = null)
    {
        $this->id = $id;
        $this->title = $title;
        $this->duration = $duration;
        $this->description = $description;
    }
    
    // Геттеры и сеттеры...
}
```

#### `src/Entity/Booking.php`
```php
<?php

namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class Booking
{
    private string $id;
    
    #[Assert\NotBlank]
    private string $eventTypeId;
    
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private string $guestName;
    
    #[Assert\NotBlank]
    #[Assert\Email]
    private string $guestEmail;
    
    #[Assert\NotBlank]
    #[Assert\GreaterThan('now')]
    private \DateTimeImmutable $startTime;
    
    private \DateTimeImmutable $endTime;
    private \DateTimeImmutable $createdAt;
    
    public function __construct(
        string $id,
        string $eventTypeId,
        string $guestName,
        string $guestEmail,
        \DateTimeImmutable $startTime,
        \DateTimeImmutable $endTime
    ) {
        $this->id = $id;
        $this->eventTypeId = $eventTypeId;
        $this->guestName = $guestName;
        $this->guestEmail = $guestEmail;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
        $this->createdAt = new \DateTimeImmutable('now');
    }
    
    // Геттеры...
}
```

---

### DTO (Data Transfer Objects)

#### `src/DTO/CreateBookingDTO.php`
```php
<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateBookingDTO
{
    #[Assert\NotBlank]
    public string $eventTypeId;
    
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    public string $guestName;
    
    #[Assert\NotBlank]
    #[Assert\Email]
    public string $guestEmail;
    
    #[Assert\NotBlank]
    #[Assert\DateTime(format: 'Y-m-d\TH:i:s\Z')]
    public string $startTime; // ISO 8601 UTC
}
```

#### `src/DTO/BookingDTO.php` (для ответов)
```php
<?php

namespace App\DTO;

use JMS\Serializer\Annotation as Serializer;

class BookingDTO
{
    #[Serializer\SerializedName('id')]
    public string $id;
    
    #[Serializer\SerializedName('eventTypeId')]
    public string $eventTypeId;
    
    #[Serializer\SerializedName('guestName')]
    public string $guestName;
    
    #[Serializer\SerializedName('guestEmail')]
    public string $guestEmail;
    
    #[Serializer\SerializedName('startTime')]
    public string $startTime; // ISO 8601
    
    #[Serializer\SerializedName('endTime')]
    public string $endTime; // ISO 8601
    
    #[Serializer\SerializedName('createdAt')]
    public string $createdAt; // ISO 8601
}
```

---

### In-memory репозитории

#### `src/Repository/InMemoryEventTypeRepository.php`
```php
<?php

namespace App\Repository;

use App\Entity\EventType;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

class InMemoryEventTypeRepository
{
    private ArrayAdapter $cache;
    private const CACHE_KEY = 'event_types';
    
    public function __construct(ArrayAdapter $cacheAdapter)
    {
        $this->cache = $cacheAdapter;
    }
    
    public function save(EventType $eventType): void
    {
        $items = $this->findAll();
        $items[$eventType->getId()] = $eventType;
        $this->cache->set(self::CACHE_KEY, $items);
    }
    
    public function findAll(): array
    {
        $item = $this->cache->getItem(self::CACHE_KEY);
        return $item->get() ?? [];
    }
    
    public function findById(string $id): ?EventType
    {
        $items = $this->findAll();
        return $items[$id] ?? null;
    }
    
    public function delete(string $id): void
    {
        $items = $this->findAll();
        unset($items[$id]);
        $this->cache->set(self::CACHE_KEY, $items);
    }
}
```

#### `src/Repository/InMemoryBookingRepository.php`
```php
<?php

namespace App\Repository;

use App\Entity\Booking;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

class InMemoryBookingRepository
{
    private ArrayAdapter $cache;
    private const CACHE_KEY = 'bookings';
    
    public function __construct(ArrayAdapter $cacheAdapter)
    {
        $this->cache = $cacheAdapter;
    }
    
    public function save(Booking $booking): void
    {
        $items = $this->findAll();
        $items[$booking->getId()] = $booking;
        $this->cache->set(self::CACHE_KEY, $items);
    }
    
    public function findAll(): array
    {
        $item = $this->cache->getItem(self::CACHE_KEY);
        return $item->get() ?? [];
    }
    
    public function findById(string $id): ?Booking
    {
        $items = $this->findAll();
        return $items[$id] ?? null;
    }
    
    public function delete(string $id): void
    {
        $items = $this->findAll();
        unset($items[$id]);
        $this->cache->set(self::CACHE_KEY, $items);
    }
    
    public function findConflicting(string $eventTypeId, \DateTimeImmutable $startTime, \DateTimeImmutable $endTime): ?Booking
    {
        foreach ($this->findAll() as $booking) {
            if ($booking->getEventTypeId() === $eventTypeId) {
                continue;
            }
            
            $bookingStart = $booking->getStartTime();
            $bookingEnd = $booking->getEndTime();
            
            if ($startTime < $bookingEnd && $endTime > $bookingStart) {
                return $booking;
            }
        }
        return null;
    }
}
```

---

### Сервисы

#### `src/Service/AvailabilityService.php`
```php
<?php

namespace App\Service;

use App\Repository\InMemoryBookingRepository;

class AvailabilityService
{
    private int $workingHoursStart = 9;  // 9:00
    private int $workingHoursEnd = 21;   // 21:00
    private int $availabilityDays = 14;
    private int $slotInterval = 30; // минут
    
    private InMemoryBookingRepository $bookingRepository;
    
    public function __construct(InMemoryBookingRepository $bookingRepository)
    {
        $this->bookingRepository = $bookingRepository;
    }
    
    public function getSlots(
        string $eventTypeId,
        \DateTimeImmutable $from,
        \DateTimeImmutable $to
    ): array {
        $slots = [];
        $current = $from->modify('midnight');
        $end = $to->modify('midnight');
        
        // Ограничиваем 14 днями
        $maxDays = $this->availabilityDays;
        
        while ($current <= $end && $maxDays > 0) {
            $dayStart = $current->setTime($this->workingHoursStart, 0);
            $dayEnd = $current->setTime($this->workingHoursEnd, 0);
            
            $slotStart = clone $dayStart;
            while ($slotStart < $dayEnd) {
                $slotEnd = $slotStart->modify("+{$this->slotInterval} minutes");
                
                // Проверяем, не занят ли слот
                $conflicting = $this->bookingRepository->findConflicting(
                    $eventTypeId,
                    $slotStart,
                    $slotEnd
                );
                
                $slots[] = [
                    'start' => $slotStart->format('Y-m-d\TH:i:s\Z'),
                    'end' => $slotEnd->format('Y-m-d\TH:i:s\Z'),
                    'isAvailable' => $conflicting === null,
                ];
                
                $slotStart = clone $slotEnd;
            }
            
            $current = $current->modify('+1 day');
            $maxDays--;
        }
        
        return $slots;
    }
}
```

---

### Контроллеры (с аннотациями NelmioApiDoc)

#### `src/Controller/EventTypeController.php`
```php
<?php

namespace App\Controller;

use App\DTO\CreateEventTypeDTO;
use App\DTO\EventTypeDTO;
use App\Entity\EventType;
use App\Service\EventTypeService;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class EventTypeController extends AbstractFOSRestController
{
    private EventTypeService $service;
    private ValidatorInterface $validator;
    
    public function __construct(EventTypeService $service, ValidatorInterface $validator)
    {
        $this->service = $service;
        $this->validator = $validator;
    }
    
    #[Rest\Get('/api/event-types')]
    #[OA\Get(
        summary: 'Получить все типы событий',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Список типов событий',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: new Model(type: EventTypeDTO::class))
                )
            )
        ]
    )]
    public function getAll(): Response
    {
        $eventTypes = $this->service->getAll();
        $dtos = array_map(fn($et) => EventTypeDTO::fromEntity($et), $eventTypes);
        return $this->handleView($this->view($dtos, Response::HTTP_OK));
    }
    
    #[Rest\Get('/api/event-types/{id}')]
    public function getOne(string $id): Response
    {
        $eventType = $this->service->getById($id);
        if (!$eventType) {
            return $this->handleView($this->view(
                ['code' => 'NOT_FOUND', 'message' => 'Event type not found'],
                Response::HTTP_NOT_FOUND
            ));
        }
        return $this->handleView($this->view(
            EventTypeDTO::fromEntity($eventType),
            Response::HTTP_OK
        ));
    }
    
    #[Rest\Post('/api/event-types')]
    public function create(Request $request): Response
    {
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            CreateEventTypeDTO::class,
            'json'
        );
        
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->handleView($this->view(
                ['code' => 'VALIDATION_ERROR', 'message' => (string) $errors],
                Response::HTTP_BAD_REQUEST
            ));
        }
        
        $eventType = $this->service->create($dto);
        return $this->handleView($this->view(
            EventTypeDTO::fromEntity($eventType),
            Response::HTTP_CREATED
        ));
    }
    
    // Аналогично для PUT и DELETE...
}
```

#### `src/Controller/BookingController.php`
```php
<?php

namespace App\Controller;

use App\DTO\CreateBookingDTO;
use App\DTO\BookingDTO;
use App\Service\BookingService;
use App\Service\AvailabilityService;
use App\Exception\ConflictException;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class BookingController extends AbstractFOSRestController
{
    private BookingService $bookingService;
    private AvailabilityService $availabilityService;
    private ValidatorInterface $validator;
    
    public function __construct(
        BookingService $bookingService,
        AvailabilityService $availabilityService,
        ValidatorInterface $validator
    ) {
        $this->bookingService = $bookingService;
        $this->availabilityService = $availabilityService;
        $this->validator = $validator;
    }
    
    #[Rest\Get('/api/availability')]
    public function getAvailability(Request $request): Response
    {
        $eventTypeId = $request->query->get('eventTypeId');
        $from = $request->query->get('from');
        $to = $request->query->get('to');
        
        // Валидация параметров
        if (!$eventTypeId || !$from || !$to) {
            return $this->handleView($this->view(
                ['code' => 'VALIDATION_ERROR', 'message' => 'Missing required parameters'],
                Response::HTTP_BAD_REQUEST
            ));
        }
        
        $fromDate = new \DateTimeImmutable($from);
        $toDate = new \DateTimeImmutable($to);
        
        $slots = $this->availabilityService->getSlots($eventTypeId, $fromDate, $toDate);
        return $this->handleView($this->view($slots, Response::HTTP_OK));
    }
    
    #[Rest\Post('/api/bookings')]
    public function createBooking(Request $request): Response
    {
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            CreateBookingDTO::class,
            'json'
        );
        
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->handleView($this->view(
                ['code' => 'VALIDATION_ERROR', 'message' => (string) $errors],
                Response::HTTP_BAD_REQUEST
            ));
        }
        
        try {
            $booking = $this->bookingService->create($dto);
            return $this->handleView($this->view(
                BookingDTO::fromEntity($booking),
                Response::HTTP_CREATED
            ));
        } catch (ConflictException $e) {
            return $this->handleView($this->view(
                ['code' => 'CONFLICT', 'message' => $e->getMessage()],
                Response::HTTP_CONFLICT
            ));
        }
    }
    
    #[Rest\Get('/api/bookings')]
    public function getAllBookings(): Response
    {
        $bookings = $this->bookingService->getAll();
        $dtos = array_map(fn($b) => BookingDTO::fromEntity($b), $bookings);
        return $this->handleView($this->view($dtos, Response::HTTP_OK));
    }
    
    // Аналогично для GET /{id} и DELETE /{id}
}
```

---

### Dockerfile для бэкенда

```dockerfile
# backend/Dockerfile
FROM php:8.3-fpm-alpine

# Устанавливаем расширения
RUN apk add --no-cache \
    git \
    unzip \
    && docker-php-ext-install intl opcache

# Устанавливаем Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Копируем composer файлы
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction

# Копируем код
COPY . .

# Запускаем скрипты после копирования
RUN composer install --no-interaction --optimize-autoloader \
    && composer dump-autoload --optimize

# Настройка PHP
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

# Порт из переменной окружения
ENV PORT=8080
EXPOSE $PORT

# Запуск встроенного сервера
CMD php -S 0.0.0.0:$PORT -t public
```

---

### `docker-compose.yml` (локальная разработка)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "${PORT:-8080}:${PORT:-8080}"
    environment:
      - PORT=${PORT:-8080}
      - APP_ENV=dev
    volumes:
      - ./backend:/app
    command: php -S 0.0.0.0:8080 -t public

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080
    command: npm run dev

  # Для E2E тестов
  playwright:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    depends_on:
      - backend
      - frontend
    environment:
      - BASE_URL=http://frontend:5173
    command: npx playwright test
```

---

### Makefile (упрощённые команды)

```makefile
.PHONY: install dev build test

install:
	docker-compose run --rm backend composer install

dev:
	docker-compose up -d

build:
	docker-compose build

test:
	docker-compose run --rm backend php bin/phpunit

e2e:
	docker-compose up -d --wait
	docker-compose run --rm playwright
	docker-compose down

generate-api:
	cd typespec && npx tsp compile main.tsp --emit @typespec/openapi3 --output-dir ../openapi
```

---

### Composer.json (backend)

```json
{
    "name": "hexlet/calendar-api",
    "type": "project",
    "require": {
        "php": ">=8.3",
        "symfony/framework-bundle": "7.2.*",
        "symfony/cache": "7.2.*",
        "symfony/validator": "7.2.*",
        "friendsofsymfony/rest-bundle": "^3.8",
        "jms/serializer-bundle": "^5.4",
        "nelmio/api-doc-bundle": "^4.0",
        "symfony/dotenv": "7.2.*"
    },
    "require-dev": {
        "symfony/maker-bundle": "^1.60",
        "phpunit/phpunit": "^11.0",
        "symfony/phpunit-bridge": "^7.0"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "scripts": {
        "post-install-cmd": [
            "Symfony\\Component\\Dotenv\\Dotenv::boot"
        ]
    },
    "minimum-stability": "stable"
}
```

---

### Переменные окружения (`.env`)

```env
# .env
APP_ENV=dev
APP_DEBUG=1
PORT=8080

# Для Docker
DATABASE_URL=sqlite:///%kernel.project_dir%/var/data.db
```

---

### Тесты (PHPUnit)

#### `tests/BookingControllerTest.php`
```php
<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BookingControllerTest extends WebTestCase
{
    public function testCreateBookingSuccess(): void
    {
        $client = static::createClient();
        
        $payload = [
            'eventTypeId' => 'evt_123',
            'guestName' => 'Ivan Petrov',
            'guestEmail' => 'ivan@example.com',
            'startTime' => '2026-06-15T10:00:00Z',
        ];
        
        $client->request(
            'POST',
            '/api/bookings',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );
        
        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
    }
    
    public function testCreateBookingConflict(): void
    {
        // Тест на конфликт слотов
    }
}
```

---

### Инструкция для агента: пошаговый план действий

**Шаг 1:** Создать структуру папок по спецификации

**Шаг 2:** Создать `composer.json` и установить зависимости

**Шаг 3:** Создать Entity и DTO классы

**Шаг 4:** Создать In-memory репозитории

**Шаг 5:** Создать сервисы (EventType, Booking, Availability)

**Шаг 6:** Создать контроллеры (EventType, Booking)

**Шаг 7:** Настроить CORS, маршруты, документацию

**Шаг 8:** Создать Dockerfile и docker-compose.yml

**Шаг 9:** Написать PHPUnit-тесты для API

**Шаг 10:** Настроить интеграцию с фронтендом и CI/CD

---

### Критерии готовности (checklist для агента)

- [ ] Все эндпоинты API реализованы по TypeSpec-контракту
- [ ] In-memory хранилище работает (данные сохраняются между запросами)
- [ ] Валидация входных данных через Symfony Validator
- [ ] Конфликт слотов возвращает 409
- [ ] Документация API доступна по `/api/doc`
- [ ] CORS настроен для фронтенда
- [ ] Docker-образ собирается без ошибок
- [ ] Приложение запускается на порту из `$PORT`
- [ ] PHPUnit-тесты проходят успешно
- [ ] Интеграция с фронтендом работает (можно забронировать слот)

---

## Заключение

Эта спецификация даёт агенту всё необходимое для реализации проекта на Symfony. **Вы можете скопировать этот текст и отправить его агенту как задание** (предварительно приложив ваш `main.tsp` из TypeSpec).

Если нужны **конкретные готовые файлы** (полный код всех классов) — я могу написать их полностью, и вы скопируете. Напишите, что удобнее.

