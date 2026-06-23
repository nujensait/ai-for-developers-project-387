# PLAN — Сервис бронирования «Календарь»

> План выполнения ТЗ (`doc/AGENT_TZ.md`) с учётом уточнений заказчика.
> Подход: Design-First. Поставка: контракт (TypeSpec) + backend (Symfony 7.2) + Docker + Makefile + README.

## 0. Ключевые решения (согласовано с заказчиком)
- **Хранилище:** **SQLite через Doctrine ORM** (не in-memory) — данные переживают перезапуски.
  `DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"`.
- **Порт:** по умолчанию **8081** (через переменную `PORT`); не 8080 и не 80.
- **TypeSpec:** переносится в `typespec/main.tsp` и переписывается как контракт Calendar API;
  генерация OpenAPI скриптом `npm run generate:api` в `./openapi`.
- **Стек API:** нативный Symfony 7.2 (атрибут-роутинг + Validator + JsonResponse) вместо
  FOSRestBundle/JMS/Nelmio — меньше зависимостей и рисков сборки (см. §2).
- **Документация `/api/doc`:** Swagger UI (CDN), который читает OpenAPI, сгенерированный из TypeSpec —
  честный Design-First, без тяжёлых бандлов.
- **Охват этой итерации:** TypeSpec + backend + SQLite + Docker + Makefile + README.
  Frontend / E2E / CI — последующие фазы (см. §8).

## 1. Окружение и предпосылки
- PHP локально **8.4**, но **`pdo_sqlite`, `intl` локально отсутствуют** → backend (composer, схема БД,
  тесты) выполняется и проверяется **в Docker** (там ставится `pdo_sqlite`).
- Docker daemon **UP**; Compose — `docker-compose` (v2.27). Образ: `php:8.3-cli-alpine`.
- Node 22 / npm 10 — для TypeSpec локально (бинарь `tsp` доступен).

## 2. Отклонения от ТЗ (зафиксированы в коде, WORK_LOG, README)
1. **Хранилище:** SQLite + Doctrine ORM (по требованию заказчика) вместо `ArrayAdapter`.
2. **`findConflicting`:** исправлена инвертированная логика (`AGENT_TZ.md:404`); конфликт =
   пересечение интервалов по **всем** бронированиям (одна календарная сетка).
3. **Стек:** без FOSRestBundle/JMS/Nelmio — нативные контроллеры Symfony, ручной маппинг DTO,
   кастомный CORS-subscriber, exception→JSON listener. Причина: совместимость и надёжность сборки на SF 7.2.
4. **Документация:** Swagger UI + OpenAPI из TypeSpec (вместо аннотаций Nelmio).
5. **Сервер:** `php -S 0.0.0.0:$PORT -t public public/index.php` (с router-скриптом — иначе `/api/*` не маршрутизируется).
6. **Порт:** 8081 по умолчанию.

## 3. Допущения
- Календарь одного владельца, без авторизации (по README).
- `endTime` вычисляется из `EventType.duration`.
- Слоты: интервал 30 мин, 09:00–21:00, на 14 дней — из параметров `services.yaml`.
- Формат ID: `evt_*` / `bok_*`.
- Все даты — UTC, ISO 8601 (`Y-m-d\TH:i:s\Z`).

---

## 4. Шаги реализации (текущая итерация)

### Шаг 1 — Контракт (TypeSpec → OpenAPI)
- `typespec/main.tsp`: модели `EventType`, `Booking`, `TimeSlot`, `Error`; CRUD `/api/event-types`,
  `GET /api/availability`, `POST/GET/DELETE /api/bookings`; валидация (email, обязательные поля).
- `package.json`: скрипт `generate:api`; `npm run generate:api` → `./openapi`.
- **Готово:** OpenAPI сгенерирован без ошибок.

### Шаг 2 — Каркас backend
- `backend/composer.json` (framework-bundle, runtime, dotenv, validator, yaml, console;
  doctrine/orm, doctrine-bundle, doctrine-migrations-bundle; dev: phpunit ^11, phpunit-bridge, browser-kit, css-selector).
- `public/index.php`, `src/Kernel.php`, `bin/console`, `config/*`, `.env`, `.env.test`.
- **Готово:** контейнер поднимается; `GET /api/event-types` → `[]`.

### Шаг 3 — Доменная модель (Doctrine)
- `Entity/EventType`, `Entity/Booking` с ORM-атрибутами.
- `Repository/EventTypeRepository`, `Repository/BookingRepository` (исправленный `findConflicting`).
- **Готово:** схема создаётся; CRUD работает.

### Шаг 4 — DTO / Сервисы / Исключения
- DTO: `CreateEventTypeDTO`, `EventTypeDTO`, `CreateBookingDTO`, `BookingDTO`, `SlotDTO`.
- `EventTypeService`, `BookingService` (конфликт → `ConflictException`), `AvailabilityService`.
- `Exception/ConflictException`, `Exception/NotFoundException`.

### Шаг 5 — Контроллеры и обвязка
- `EventTypeController` (GET all/one, POST, PUT, DELETE), `BookingController` (GET all/one, POST, DELETE, GET `/availability`), `DocController` (`/api/doc`, `/api/openapi.yaml`).
- `CorsSubscriber`, `ApiExceptionSubscriber` (единый `{code,message}`; 400/404/409).
- **Готово:** сквозной `curl`-сценарий; `/api/doc` открывается.

### Шаг 6 — Тесты (PHPUnit)
- `WebTestCase`: CRUD, availability, booking 201/409, валидация 400, 404.
- Отдельная тестовая БД (`var/test.db`), пересоздание схемы в `setUp`.
- **Готово:** `php bin/phpunit` зелёный (в контейнере).

### Шаг 7 — Docker / Makefile / README
- `backend/Dockerfile` (php:8.3-cli + pdo_sqlite + opcache), `docker/entrypoint.sh`
  (создание БД + миграции/`schema:update` при старте), `docker/php.ini`.
- `docker-compose.yml` (порт `${PORT:-8081}`, том для `var/`), `Makefile` (`install/dev/test/generate-api`).
- `README.md`: установка, запуск, эндпоинты, примеры запросов.
- **Готово:** `docker-compose build` без ошибок; `up -d`; `curl :8081/api/event-types`.

---

## 5. Процесс
- `doc/WORK_LOG.md` — краткий лог по ходу разработки.
- Коммиты — только по явному запросу.
- Проверка backend — в Docker (`pdo_sqlite` доступен) + `curl` + PHPUnit.

## 6. Риски и митигации
- Нет `pdo_sqlite`/`intl` локально → всё backend-выполнение в Docker.
- Нет плагина `docker compose` → `docker-compose` (v2.27).
- Первая сборка тянет образы php/composer → нужна сеть.
- Совместимость Doctrine ORM 3 + bundle → актуальные версии, `schema:update` как страховка миграций.

## 7. Definition of Done (по чек-листу ТЗ)
- [ ] Эндпоинты по контракту TypeSpec
- [ ] Данные сохраняются между перезапусками (SQLite)
- [ ] Валидация (Symfony Validator)
- [ ] Конфликт слотов → 409
- [ ] Документация `/api/doc`
- [ ] CORS для фронтенда
- [ ] Docker-образ собирается без ошибок
- [ ] Запуск на порту `$PORT` (8081)
- [ ] PHPUnit-тесты проходят

## 8. Последующие фазы (вне текущей итерации)
- Frontend (React/Vite), E2E (Playwright), CI/CD (GitHub Actions, release-please).
- Не трогать `.github/workflows/hexlet-check.yml`.
