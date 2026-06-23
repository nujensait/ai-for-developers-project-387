# WORK LOG — Сервис «Календарь»

Краткий лог разработки (новые записи сверху).

## 2026-06-22 — Frontend (React)

- **Создан фронтенд** в `frontend/`: React 18 + TypeScript + Vite, React Router v6,
  TanStack Query, Tailwind + компоненты в стиле shadcn/ui, date-fns, react-day-picker v8.
- **Страницы:** `/` (список типов событий), `/booking/:id` (календарь 14 дней →
  слоты 30 мин 09:00–21:00 UTC → форма гостя → подтверждение; обработка 409),
  `/admin` (таблица бронирований + CRUD типов событий, отмена брони).
- **API-слой:** типизированный fetch-клиент (`ApiError`), хуки React Query
  (кэш/инвалидация), `VITE_API_URL` из окружения, ErrorBoundary, тосты (sonner).
- **Время:** слоты/брони отображаются в UTC (срез ISO-строки), чтобы сетка
  09:00–21:00 не «плыла» от таймзоны браузера.
- **Инфра:** `Dockerfile.dev` (hot-reload), сервис `frontend` в `docker-compose.yml`,
  обновлён корневой `Makefile` (install/dev/build/up/down/stop/deploy, frontend-*).
- **Бэкенд не менялся:** CORS уже настроен (`CorsSubscriber`, `*`).
- **Проверка:** `npm install` + `npm run build` (tsc + vite) во `frontend/`.

## 2026-06-22

- **Старт.** Прочитано ТЗ (`doc/AGENT_TZ.md`), согласованы уточнения заказчика:
  SQLite+Doctrine вместо in-memory, порт по умолчанию 8081, полная поставка backend+Docker+Makefile+README.
- **Окружение проверено:** PHP 8.4 локально (нет `pdo_sqlite`/`intl`), Docker UP,
  `docker-compose` v2.27, Node 22 + `tsp`. Решение: backend собирается/проверяется в Docker.
- **PLAN.md обновлён:** зафиксированы решения, отклонения от ТЗ (SQLite, нативный стек Symfony
  без FOSRest/JMS/Nelmio, Swagger UI из TypeSpec-OpenAPI), порт 8081.
